const Attendance = require('../../models/Attendance');
const Settings = require('../../models/Settings');

// ── Haversine distance (meters) ──────────────────────────
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Check In ─────────────────────────────────────────────
exports.checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const tenantId = req.user.tenantId;
        const today = new Date().toISOString().slice(0, 10);
        const now = new Date();

        // Prevent duplicate check-in
        const existing = await Attendance.findOne({ employee: userId, date: today, tenantId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already checked in today' });
        }

        const { latitude, longitude } = req.body;
        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: 'GPS location is required' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Selfie image is required' });
        }

        // Get tenant settings for geofence
        let settings = await Settings.findOne({ tenantId });
        if (!settings) {
            settings = await Settings.findOne({ singletonId: 'global_settings' });
        }

        let locationVerified = false;
        if (settings && settings.officeLocation && settings.officeLocation.latitude && settings.officeLocation.longitude) {
            const dist = haversineDistance(
                parseFloat(latitude), parseFloat(longitude),
                settings.officeLocation.latitude, settings.officeLocation.longitude
            );
            locationVerified = dist <= (settings.officeLocation.radiusMeters || 100);
        }

        // Determine status: Present or Late
        let status = 'Present';
        if (settings && settings.lateThresholdTime) {
            const [threshH, threshM] = settings.lateThresholdTime.split(':').map(Number);
            const currentH = now.getHours();
            const currentM = now.getMinutes();
            if (currentH > threshH || (currentH === threshH && currentM > threshM)) {
                status = 'Late';
            }
        }

        const selfieUrl = `/uploads/selfies/${req.file.filename}`;

        const record = new Attendance({
            employee: userId,
            tenantId,
            date: today,
            checkIn: now,
            status,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            selfieUrl,
            locationVerified,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
            deviceInfo: req.headers['user-agent'] || '',
            activeLogins: [{ in: now, out: null }],
        });

        await record.save();
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── Check Out ────────────────────────────────────────────
exports.checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const tenantId = req.user.tenantId;
        const today = new Date().toISOString().slice(0, 10);
        const now = new Date();

        const record = await Attendance.findOne({ employee: userId, date: today, tenantId });
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

// ── Today's Attendance (used by dashboard widget) ────────
exports.getTodayAttendance = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const tenantId = req.user.tenantId;

        const query = { date: today };
        // Include records with matching tenantId OR records without tenantId (legacy)
        if (tenantId) {
            query.$or = [{ tenantId }, { tenantId: { $exists: false } }, { tenantId: null }];
        }
        if (req.user.role !== 'admin') {
            query.employee = req.user.id;
            delete query.$or; // For non-admins, just filter by their own employee ID
        }

        const records = await Attendance.find(query).populate('employee', 'name role');
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── My Attendance (employee's own records) ───────────────
exports.getMyAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;

        const query = { employee: userId };

        if (month && year) {
            const m = String(month).padStart(2, '0');
            query.date = { $regex: `^${year}-${m}` };
        }

        const records = await Attendance.find(query).sort({ date: -1 });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── Tenant Report (admin) ────────────────────────────────
exports.getTenantReport = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { date, month, year, employeeId } = req.query;

        // Build query — include records with matching tenantId OR without tenantId (legacy)
        const query = {};
        if (tenantId) {
            // Get all employees of this tenant to scope old records
            const User = require('../../models/User');
            const tenantEmployees = await User.find({ tenantId }, '_id');
            const tenantEmployeeIds = tenantEmployees.map(e => e._id);

            query.$or = [
                { tenantId },
                { tenantId: { $exists: false }, employee: { $in: tenantEmployeeIds } },
                { tenantId: null, employee: { $in: tenantEmployeeIds } },
            ];
        }

        if (employeeId) {
            query.employee = employeeId;
        }

        if (date) {
            query.date = date;
        } else if (month && year) {
            const m = String(month).padStart(2, '0');
            query.date = { $regex: `^${year}-${m}` };
        }

        const records = await Attendance.find(query)
            .populate('employee', 'name role email phone')
            .sort({ date: -1 });

        // Compute summary
        const presentCount = records.filter(r => r.status === 'Present').length;
        const lateCount = records.filter(r => r.status === 'Late').length;
        const absentCount = records.filter(r => r.status === 'Absent').length;

        res.status(200).json({
            success: true,
            data: records,
            summary: { presentCount, lateCount, absentCount, totalRecords: records.length }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── Attendance by Date (kept for backward compat) ────────
exports.getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }

        const tenantId = req.user.tenantId;
        const query = { date };

        if (req.user.role !== 'admin') {
            query.employee = req.user.id;
        } else if (tenantId) {
            query.$or = [{ tenantId }, { tenantId: { $exists: false } }, { tenantId: null }];
        }

        const records = await Attendance.find(query).populate('employee', 'name role');
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

