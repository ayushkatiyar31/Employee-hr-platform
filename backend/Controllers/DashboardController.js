const Employee = require('../Models/EmployeeModel');
const Attendance = require('../Models/AttendanceModel');
const Leave = require('../Models/LeaveModel');

const getAdminDashboard = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.slice(0, 7);

        const [totalEmployees, activeEmployees, inactiveEmployees, todayAttendance, pendingLeaves, totalLeaves] =
            await Promise.all([
                Employee.countDocuments(),
                Employee.countDocuments({ status: 'active' }),
                Employee.countDocuments({ status: 'inactive' }),
                Attendance.countDocuments({ date: today }),
                Leave.countDocuments({ status: 'pending' }),
                Leave.countDocuments({
                    createdAt: {
                        $gte: new Date(`${currentMonth}-01T00:00:00.000Z`)
                    }
                })
            ]);

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                activeEmployees,
                inactiveEmployees,
                attendanceSummary: {
                    todayPresent: todayAttendance,
                    todayAbsent: Math.max(totalEmployees - todayAttendance, 0)
                },
                leaveOverview: {
                    pending: pendingLeaves,
                    totalThisMonth: totalLeaves
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const getEmployeeDashboard = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id }).lean();
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee profile not found'
            });
        }

        const [attendanceCount, leaveCount, pendingLeaves, approvedLeaves] = await Promise.all([
            Attendance.countDocuments({ employee: employee._id }),
            Leave.countDocuments({ employee: employee._id }),
            Leave.countDocuments({ employee: employee._id, status: 'pending' }),
            Leave.countDocuments({ employee: employee._id, status: 'approved' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                profile: employee,
                attendanceSummary: {
                    totalMarkedDays: attendanceCount
                },
                leaveSummary: {
                    totalRequests: leaveCount,
                    pending: pendingLeaves,
                    approved: approvedLeaves,
                    balance: employee.leaveBalance
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminDashboard,
    getEmployeeDashboard
};
