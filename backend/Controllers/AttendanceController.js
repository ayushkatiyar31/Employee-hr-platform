const Attendance = require('../Models/AttendanceModel');
const Employee = require('../Models/EmployeeModel');

const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const diffHours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    return Number(diffHours.toFixed(2));
};

const markCheckIn = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const date = new Date().toISOString().split('T')[0];
        let attendance = await Attendance.findOne({ employee: employee._id, date });

        if (attendance?.checkIn) {
            return res.status(400).json({ success: false, message: 'Check-in already marked for today' });
        }

        if (!attendance) {
            attendance = await Attendance.create({
                employee: employee._id,
                date,
                checkIn: new Date(),
                status: 'present'
            });
        } else {
            attendance.checkIn = new Date();
            await attendance.save();
        }

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        next(error);
    }
};

const markCheckOut = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const date = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ employee: employee._id, date });

        if (!attendance?.checkIn) {
            return res.status(400).json({ success: false, message: 'Check-in is required before check-out' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ success: false, message: 'Check-out already marked for today' });
        }

        attendance.checkOut = new Date();
        attendance.workingHours = calculateWorkingHours(attendance.checkIn, attendance.checkOut);
        await attendance.save();

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        next(error);
    }
};

const getMyAttendance = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const records = await Attendance.find({ employee: employee._id }).sort({ date: -1 }).limit(31);
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        next(error);
    }
};

const getAllAttendance = async (req, res, next) => {
    try {
        const { month, employeeId } = req.query;
        const filter = {};

        if (employeeId) {
            filter.employee = employeeId;
        }

        if (month) {
            filter.date = { $regex: `^${month}` };
        }

        const records = await Attendance.find(filter)
            .populate('employee', 'name employeeCode department designation')
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: records });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    markCheckIn,
    markCheckOut,
    getMyAttendance,
    getAllAttendance
};
