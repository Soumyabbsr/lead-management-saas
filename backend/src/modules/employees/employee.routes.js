const express = require('express');
const {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    deleteEmployee,
} = require('./employee.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');
const { planGuard } = require('../../middlewares/planGuard.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect, planGuard);

// READ: available to all authenticated users (Sales need team list for reassignment dropdowns)
router.get('/', getEmployees);
router.get('/:id', getEmployee);

// WRITE: Admin only
router.post('/', authorize('admin'), createEmployee);
router.put('/:id', authorize('admin'), updateEmployee);
router.delete('/:id', authorize('admin'), deleteEmployee);
router.put('/:id/status', authorize('admin'), toggleEmployeeStatus);

module.exports = router;
