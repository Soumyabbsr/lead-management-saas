const express = require('express');
const {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    addLeadNote,
} = require('./lead.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');
const { planGuard } = require('../../middlewares/planGuard.middleware');

const router = express.Router();

router.use(protect, planGuard); // All routes require auth

router.route('/')
    .get(authorize('admin', 'sales'), getLeads)
    .post(authorize('admin', 'sales'), createLead);

router.route('/:id')
    .get(authorize('admin', 'sales'), getLead)
    .put(authorize('admin', 'sales'), updateLead)
    .delete(authorize('admin'), deleteLead); // Only admin can delete

router.post('/:id/notes', authorize('admin', 'sales'), addLeadNote);

module.exports = router;
