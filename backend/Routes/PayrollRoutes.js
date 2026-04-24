const router = require('express').Router();
const { createPayroll, getPayrolls } = require('../Controllers/PayrollController');
const { auth, authorize } = require('../Middlewares/auth');

router.get('/', auth, getPayrolls);
router.post('/', auth, authorize('admin', 'hr', 'manager'), createPayroll);

module.exports = router;
