const asyncHandler = require('express-async-handler');
const User = require('../../models/User');
const Activity = require('../../models/Activity');
const Tenant = require('../../models/Tenant');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = asyncHandler(async (req, res) => {
    const employees = await User.find({ role: { $ne: 'super_admin' }, tenantId: req.user.tenantId }); // Or get everyone
    res.status(200).json({ success: true, count: employees.length, data: employees });
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private/Admin
const getEmployee = asyncHandler(async (req, res) => {
    const employee = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!employee) {
        res.status(404);
        throw new Error('Employee not found');
    }
    res.status(200).json({ success: true, data: employee });
});

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = asyncHandler(async (req, res) => {
    // Check limits
    const tenant = await Tenant.findById(req.user.tenantId);
    if (tenant.currentEmployeeCount >= tenant.employeeLimit) {
        res.status(403);
        throw new Error('Employee limit reached for this plan');
    }

    // Check if email exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    const employee = await User.create({ ...req.body, tenantId: req.user.tenantId });

    // Increment tenant counter
    tenant.currentEmployeeCount += 1;
    await tenant.save();

    // Log activity
    await Activity.create({
        type: 'EMPLOYEE_CREATED',
        description: `Created new employee: ${employee.name} (${employee.role})`,
        performedBy: req.user._id,
        tenantId: req.user.tenantId,
    });

    res.status(201).json({ success: true, data: employee });
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = asyncHandler(async (req, res) => {
    let employee = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!employee) {
        res.status(404);
        throw new Error('Employee not found');
    }

    // Prevent updating password through this route
    if (req.body.password) {
        delete req.body.password;
    }

    employee = await User.findOneAndUpdate(
        { _id: req.params.id, tenantId: req.user.tenantId },
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    // Log activity
    await Activity.create({
        type: 'EMPLOYEE_UPDATED',
        description: `Updated details for employee: ${employee.name}`,
        performedBy: req.user._id,
        tenantId: req.user.tenantId,
    });

    res.status(200).json({ success: true, data: employee });
});

// @desc    Deactivate/Toggle Status employee
// @route   PUT /api/employees/:id/status
// @access  Private/Admin
const toggleEmployeeStatus = asyncHandler(async (req, res) => {
    let employee = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!employee) {
        res.status(404);
        throw new Error('Employee not found');
    }

    employee.status = employee.status === 'Active' ? 'Inactive' : 'Active';
    await employee.save();

    // Log activity
    await Activity.create({
        type: 'EMPLOYEE_DEACTIVATED', // Or activated
        description: `Changed status to ${employee.status} for employee: ${employee.name}`,
        performedBy: req.user._id,
        tenantId: req.user.tenantId,
    });

    res.status(200).json({ success: true, data: employee });
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = asyncHandler(async (req, res) => {
    const employee = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!employee) {
        res.status(404);
        throw new Error('Employee not found');
    }

    await employee.deleteOne();

    const tenant = await Tenant.findById(req.user.tenantId);
    if (tenant && tenant.currentEmployeeCount > 0) {
        tenant.currentEmployeeCount -= 1;
        await tenant.save();
    }

    await Activity.create({
        type: 'EMPLOYEE_DELETED',
        description: `Deleted employee: ${employee.name} (${employee.role})`,
        performedBy: req.user._id,
        tenantId: req.user.tenantId,
    });

    res.status(200).json({ success: true, data: {} });
});

module.exports = {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    deleteEmployee
};
