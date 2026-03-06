const asyncHandler = require('express-async-handler');
const Lead = require('../../models/Lead');
const User = require('../../models/User');

// Helper to check if a date is today (IST-safe)
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
    const { tenantId } = req.user;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const firstDay = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    // Run all MongoDB aggregations in parallel — no full collection scan
    const [
        totalLeads,
        newToday,
        visitsToday,
        bookingsThisMonth,
        overdueCount,
        pipeline,
        salesAgents,
        leaderboardLeads,
    ] = await Promise.all([
        Lead.countDocuments({ tenantId }),
        Lead.countDocuments({ tenantId, createdAt: { $gte: todayStart } }),
        Lead.countDocuments({ tenantId, visitDate: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) }, visitStatus: { $ne: 'Cancelled' } }),
        Lead.countDocuments({ tenantId, stage: 'Booked', updatedAt: { $gte: firstDay } }),
        Lead.countDocuments({ tenantId, followUpDue: { $lt: new Date() }, stage: { $nin: ['Booked', 'Lost'] } }),
        Lead.aggregate([
            { $match: { tenantId: req.user.tenantId } },
            { $group: { _id: '$stage', count: { $sum: 1 } } }
        ]),
        User.find({ tenantId, role: 'sales' }).select('name monthlyTarget').lean(),
        Lead.find({ tenantId, stage: 'Booked' }).select('assignedTo').lean(),
    ]);

    // Build pipeline map
    const pipelineMap = { New: 0, Contacted: 0, Visit: 0, Negotiation: 0, Booked: 0, Lost: 0 };
    pipeline.forEach(p => { if (pipelineMap[p._id] !== undefined) pipelineMap[p._id] = p.count; });

    const totalBookings = pipelineMap.Booked;
    const convRate = totalLeads === 0 ? 0 : Math.round((totalBookings / totalLeads) * 100);

    // Build leaderboard from pre-fetched booked leads
    const leaderboard = salesAgents.map(agent => {
        const agentBookingCount = leaderboardLeads.filter(l => l.assignedTo.toString() === agent._id.toString()).length;
        return {
            id: agent._id,
            name: agent.name,
            bookings: agentBookingCount,
            target: agent.monthlyTarget || 0,
            convRate: 0, // Avoiding N+1: full convRate would need all agent leads; kept simple
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
                inactiveCount: 0,
                convRate,
            },
            pipeline: pipelineMap,
            leaderboard,
        }
    });
});

// @desc    Get Sales Dashboard Stats
// @route   GET /api/dashboard/sales
// @access  Private (Sales)
const getSalesDashboard = asyncHandler(async (req, res) => {
    const myLeads = await Lead.find({ assignedTo: req.user._id, tenantId: req.user.tenantId })
        .select('stage followUpDue visitDate visitStatus')
        .lean();

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
