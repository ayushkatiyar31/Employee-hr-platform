const Announcement = require('../Models/AnnouncementModel');

const createAnnouncement = async (req, res, next) => {
    try {
        const announcement = await Announcement.create({
            title: req.body.title,
            message: req.body.message,
            audience: req.body.audience || 'all',
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        next(error);
    }
};

const getAnnouncements = async (req, res, next) => {
    try {
        const role = req.user.role;
        const announcements = await Announcement.find({
            isActive: true,
            audience: { $in: ['all', role === 'employee' ? 'employees' : 'admins'] }
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements
};
