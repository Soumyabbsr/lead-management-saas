const asyncHandler = require('express-async-handler');
const Lead = require('../../models/Lead');
const Booking = require('../../models/Booking');
const Visit = require('../../models/Visit');
const User = require('../../models/User');

function isInactive(date) {
    return (Date.now() - new Date(date).getTime()) > 24 * 60 * 60 * 1000;
}

// Helper to reliably check if a date is "today" regardless of UTC offsets for early morning IST times
function isToday(dateInput) {
    if (!dateInput) return false;
    const date = new Date(dateInput);
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminDashboard = asyncHandler(async (req, res) => {
    const allLeads = await Lead.find({ tenantId: req.user.tenantId });
    // Visits and Bookings are embedded in Leads, so no need to query separate collections
    const salesAgents = await User.find({ tenantId: req.user.tenantId, role: 'sales' });

    const totalLeads = allLeads.length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const newToday = allLeads.filter(l => new Date(l.createdAt) >= todayStart).length;

    // Visits today
    const visitsToday = allLeads.filter(l =>
        l.visitDate && isToday(l.visitDate) && l.visitStatus !== 'Cancelled'
    ).length;

    // Bookings this month
    const firstDay = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const bookingsThisMonth = allLeads.filter(l =>
        l.stage === 'Booked' && l.bookingDetails && new Date(l.bookingDetails.bookingDate || l.updatedAt) >= firstDay
    ).length;

    // Overdue: followUpDue is past and stage isn't booked/lost
    const overdueCount = allLeads.filter(l =>
        l.followUpDue && new Date(l.followUpDue) < new Date() && l.stage !== 'Booked' && l.stage !== 'Lost'
    ).length;

    // Inactive > 24h
    const inactiveCount = allLeads.filter(l => isInactive(l.lastActivity) && l.stage !== 'Booked' && l.stage !== 'Lost').length;

    const totalBookings = allLeads.filter(l => l.stage === 'Booked').length;
    const convRate = totalLeads === 0 ? 0 : Math.round((totalBookings / totalLeads) * 100);

    const pipeline = {
        New: allLeads.filter(l => l.stage === 'New').length,
        Contacted: allLeads.filter(l => l.stage === 'Contacted').length,
        Visit: allLeads.filter(l => l.stage === 'Visit').length,
        Negotiation: allLeads.filter(l => l.stage === 'Negotiation').length,
        Booked: allLeads.filter(l => l.stage === 'Booked').length,
        Lost: allLeads.filter(l => l.stage === 'Lost').length,
    };

    // Employee Leaderboard
    const leaderboard = salesAgents.map(agent => {
        const agentLeads = allLeads.filter(l => l.assignedTo.toString() === agent._id.toString());
        const agentBookings = agentLeads.filter(l => l.stage === 'Booked');

        const empConvRate = agentLeads.length === 0 ? 0 : Math.round((agentBookings.length / agentLeads.length) * 100);
        return {
            id: agent._id,
            name: agent.name,
            bookings: agentBookings.length,
            target: agent.monthlyTarget || 0,
            convRate: empConvRate
        };
    }).sort((a, b) => b.bookings - a.bookings);

    res.status(200).json({
        success: true,
        data: {
            metrics: {
                totalLeads,
                newToday,
                visitsToday,
                bookingsThisMonth,
                overdueCount,
                inactiveCount,
                convRate,
            },
            pipeline,
            leaderboard
        }
    });
});

// @desc    Get Sales Dashboard Stats
// @route   GET /api/dashboard/sales
// @access  Private (Sales)
const getSalesDashboard = asyncHandler(async (req, res) => {
    const myLeads = await Lead.find({ assignedTo: req.user._id });

    const stageCounts = {
        New: myLeads.filter(l => l.stage === 'New').length,
        Contacted: myLeads.filter(l => l.stage === 'Contacted').length,
        Visit: myLeads.filter(l => l.stage === 'Visit').length,
        Negotiation: myLeads.filter(l => l.stage === 'Negotiation').length,
        Booked: myLeads.filter(l => l.stage === 'Booked').length,
    };

    const overdueLeads = myLeads.filter(l =>
        l.followUpDue && new Date(l.followUpDue) < new Date() && l.stage !== 'Booked' && l.stage !== 'Lost'
    );

    const myVisits = myLeads.filter(l =>
        l.visitDate && isToday(l.visitDate) && l.visitStatus !== 'Cancelled'
    );

    const todayFollowUps = myLeads.filter(l => l.followUpDue && isToday(l.followUpDue)).length;

    res.status(200).json({
        success: true,
        data: {
            totalMyLeads: myLeads.length,
            stageCounts,
            overdueCount: overdueLeads.length,
            todayFollowUps,
            todayVisits: myVisits.length,
            hotLeads: stageCounts.Visit + stageCounts.Negotiation,
            newLeads: stageCounts.New,
            visitScheduled: stageCounts.Visit,
            negotiation: stageCounts.Negotiation,
            bookingClosed: stageCounts.Booked
        }
    });
});

module.exports = {
    getAdminDashboard,
    getSalesDashboard
};
