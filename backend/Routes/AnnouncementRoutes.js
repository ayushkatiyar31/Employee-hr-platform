const router = require('express').Router();
const { createAnnouncement, getAnnouncements } = require('../Controllers/AnnouncementController');
const { auth, authorize } = require('../Middlewares/auth');

router.get('/', auth, getAnnouncements);
router.post('/', auth, authorize('admin', 'hr', 'manager'), createAnnouncement);

module.exports = router;
