const router = require('express').Router();
const { getAdminDashboard, getEmployeeDashboard } = require('../Controllers/DashboardController');
const { auth, authorize } = require('../Middlewares/auth');

router.get('/admin', auth, authorize('admin', 'hr', 'manager'), getAdminDashboard);
router.get('/employee', auth, authorize('employee'), getEmployeeDashboard);

module.exports = router;
