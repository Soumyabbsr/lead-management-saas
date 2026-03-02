const Attendance = require('../../models/Attendance');

exports.checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().slice(0, 10);
        const now = new Date();

        // Find or create attendance record for today
        let record = await Attendance.findOne({ employee: userId, date: today });

        if (!record) {
            record = new Attendance({
                employee: userId,
                date: today,
                checkIn: now,
                activeLogins: [{ in: now, out: null }]
            });
        } else {
            // Check if already checked in (last activeLogin has no 'out')
            const lastLogin = record.activeLogins[record.activeLogins.length - 1];
            if (lastLogin && !lastLogin.out) {
                return res.status(400).json({ success: false, message: 'Already checked in' });
            }
            record.activeLogins.push({ in: now, out: null });
        }

        await record.save();
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().slice(0, 10);
        const now = new Date();

        const record = await Attendance.findOne({ employee: userId, date: today });
        if (!record) {
            return res.status(404).json({ success: false, message: 'No check-in record found for today' });
        }

        const lastLogin = record.activeLogins[record.activeLogins.length - 1];
        if (!lastLogin || lastLogin.out) {
            return res.status(400).json({ success: false, message: 'Not currently checked in' });
        }

        lastLogin.out = now;
        record.checkOut = now;

        // Calculate session duration in minutes
        const diffMs = now - lastLogin.in;
        const diffMins = Math.floor(diffMs / 60000);
        record.totalDurationMinutes += diffMins;

        await record.save();
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTodayAttendance = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);

        // Admins can see everyone, Sales can only see themselves
        const query = { date: today };
        if (req.user.role !== 'Admin') {
            query.employee = req.user.id;
        }

        const records = await Attendance.find(query).populate('employee', 'name role');
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.query; // YYYY-MM-DD
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }

        const query = { date };
        if (req.user.role !== 'Admin') {
            query.employee = req.user.id;
        }

        const records = await Attendance.find(query).populate('employee', 'name role');
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
