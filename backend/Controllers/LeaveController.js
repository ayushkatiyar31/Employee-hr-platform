const Leave = require('../Models/LeaveModel');
const Employee = require('../Models/EmployeeModel');

const ensureEmployeeProfile = async (user) => {
    let employee = await Employee.findOne({ user: user._id });

    if (!employee && user.role === 'employee') {
        employee = await Employee.create({
            user: user._id,
            employeeCode: `EMP-${Date.now().toString().slice(-6)}`,
            name: user.name,
            email: user.email,
            department: 'General',
            designation: 'Employee'
        });
    }

    return employee;
};

const updateLeaveBalance = async (employeeId, leaveType, delta) => {
    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.leaveBalance || employee.leaveBalance[leaveType] === undefined) {
        return;
    }

    employee.leaveBalance[leaveType] = Math.max((employee.leaveBalance[leaveType] || 0) + delta, 0);
    await employee.save();
};

const resolveLeaveEmployeeId = async (leave) => {
    if (leave.employee) {
        return leave.employee._id || leave.employee;
    }

    if (leave.employeeId) {
        const employee = await Employee.findOne({ employeeCode: leave.employeeId });
        return employee?._id || null;
    }

    if (leave.employeeName) {
        const employee = await Employee.findOne({ name: leave.employeeName, email: leave.email });
        return employee?._id || null;
    }

    return null;
};

const createLeave = async (req, res, next) => {
    try {
        const employee = await ensureEmployeeProfile(req.user);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const { leaveType, startDate, endDate, reason } = req.body;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ success: false, message: 'Reason is required' });
        }

        if (days <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid leave duration' });
        }

        const leave = await Leave.create({
            employee: employee._id,
            employeeId: employee.employeeCode,
            employeeName: employee.name,
            leaveType,
            startDate,
            endDate,
            days,
            reason,
            status: 'pending'
        });

        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        next(error);
    }
};

const getAllLeaves = async (req, res, next) => {
    try {
        const filter = {};
        if (req.user.role === 'employee') {
            const employee = await ensureEmployeeProfile(req.user);
            if (!employee) {
                return res.status(404).json({ success: false, message: 'Employee profile not found' });
            }
            filter.employee = employee._id;
        }

        if (req.query.status) filter.status = req.query.status;

        const leaves = await Leave.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        next(error);
    }
};

const updateLeaveStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid leave status' });
        }

        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        const previousStatus = leave.status;
        const employeeId = await resolveLeaveEmployeeId(leave);
        leave.status = status;
        leave.approvedBy = req.user.name;
        leave.approvedDate = new Date();
        leave.statusUpdatedAt = new Date();
        await leave.save();

        if (previousStatus !== status) {
            if (previousStatus === 'approved') {
                await updateLeaveBalance(employeeId, leave.leaveType, leave.days);
            }

            if (status === 'approved') {
                await updateLeaveBalance(employeeId, leave.leaveType, -leave.days);
            }
        }

        res.status(200).json({ success: true, data: leave });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLeave,
    getAllLeaves,
    updateLeaveStatus
};
