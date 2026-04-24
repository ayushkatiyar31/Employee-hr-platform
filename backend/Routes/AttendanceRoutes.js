const router = require('express').Router();
const {
    markCheckIn,
    markCheckOut,
    getMyAttendance,
    getAllAttendance
} = require('../Controllers/AttendanceController');
const { auth, authorize } = require('../Middlewares/auth');

router.post('/check-in', auth, authorize('employee'), markCheckIn);
router.post('/check-out', auth, authorize('employee'), markCheckOut);
router.get('/me', auth, authorize('employee'), getMyAttendance);
router.get('/', auth, authorize('admin', 'hr', 'manager'), getAllAttendance);

module.exports = router;
