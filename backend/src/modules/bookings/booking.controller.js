const asyncHandler = require('express-async-handler');
const Booking = require('../../models/Booking');
const Lead = require('../../models/Lead');
const Activity = require('../../models/Activity');

// @desc    Create a booking for a lead
// @route   POST /api/bookings
// @access  Private (Sales/Admin)
const createBooking = asyncHandler(async (req, res) => {
    const { leadId, propertyName, bedAssigned, advancePaid, bookingDate } = req.body;

    const lead = await Lead.findOne({ _id: leadId, tenantId: req.user.tenantId });
    if (!lead) {
        res.status(404);
        throw new Error('Lead not found');
    }

    // Check if booking already exists for this lead
    const existingBooking = await Booking.findOne({ leadId, tenantId: req.user.tenantId });
    if (existingBooking) {
        res.status(400);
        throw new Error('Booking already exists for this lead');
    }

    const booking = await Booking.create({
        tenantId: req.user.tenantId,
        leadId,
        propertyName,
        bedAssigned,
        advancePaid,
        bookingDate,
        createdBy: req.user._id,
    });

    // Auto change stage to Booked
    lead.stage = 'Booked';
    await lead.save();

    // Auto activity log
    await Activity.create({
        tenantId: req.user.tenantId,
        leadId,
        type: 'BOOKING_CREATED',
        description: `Booking confirmed for ${propertyName}, Bed: ${bedAssigned}. Advance Paid: ₹${advancePaid}`,
        performedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: booking });
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = asyncHandler(async (req, res) => {
    let query = Booking.find({ tenantId: req.user.tenantId }).populate('leadId', 'name phone assignedTo');

    const bookings = await query;

    // Filter if sales user (only see own leads' bookings)
    let result = bookings;
    if (req.user.role === 'sales') {
        result = bookings.filter(b => b.leadId && b.leadId.assignedTo.toString() === req.user._id.toString());
    }

    res.status(200).json({ success: true, count: result.length, data: result });
});

module.exports = {
    createBooking,
    getBookings,
};
