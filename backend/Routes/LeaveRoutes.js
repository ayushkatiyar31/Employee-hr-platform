const express = require('express');
const router = express.Router();
const {
    createLeave,
    getAllLeaves,
    updateLeaveStatus
} = require('../Controllers/LeaveController');
const { validateLeave } = require('../Middlewares/validation');
const { auth, authorize } = require('../Middlewares/auth');

router.post('/', auth, authorize('employee'), validateLeave, createLeave);
router.get('/', auth, getAllLeaves);
router.put('/:id/status', auth, authorize('admin'), updateLeaveStatus);

module.exports = router;
