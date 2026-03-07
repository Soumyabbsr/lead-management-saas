const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { planGuard } = require('../../middlewares/planGuard.middleware');
const {
    checkIn,
    checkOut,
    getTodayAttendance,
    getMyAttendance,
    getTenantReport,
    getAttendanceByDate,
} = require('./attendance.controller');

const router = express.Router();

// ── Multer config for selfie uploads ─────────────────────
const uploadDir = path.join(__dirname, '../../../public/uploads/selfies');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname || '.jpg')}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

// ── Routes ───────────────────────────────────────────────
router.use(protect, planGuard);

router.post('/check-in', upload.single('selfie'), checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayAttendance);
router.get('/my', getMyAttendance);
router.get('/tenant-report', authorize('admin'), getTenantReport);
router.get('/', getAttendanceByDate);

module.exports = router;
