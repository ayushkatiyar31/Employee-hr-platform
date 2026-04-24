const Payroll = require('../Models/PayrollModel');
const Employee = require('../Models/EmployeeModel');

const createPayroll = async (req, res, next) => {
    try {
        const { employee, month, basicSalary, allowances = 0, deductions = 0, status = 'generated' } = req.body;
        const netSalary = Number(basicSalary) + Number(allowances) - Number(deductions);

        const payroll = await Payroll.findOneAndUpdate(
            { employee, month },
            {
                employee,
                month,
                basicSalary: Number(basicSalary),
                allowances: Number(allowances),
                deductions: Number(deductions),
                netSalary,
                status
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(201).json({ success: true, data: payroll });
    } catch (error) {
        next(error);
    }
};

const getPayrolls = async (req, res, next) => {
    try {
        let filter = {};

        if (req.user.role === 'employee') {
            const employee = await Employee.findOne({ user: req.user._id });
            if (!employee) {
                return res.status(404).json({ success: false, message: 'Employee profile not found' });
            }
            filter.employee = employee._id;
        } else if (req.query.employee) {
            filter.employee = req.query.employee;
        }

        const payrolls = await Payroll.find(filter)
            .populate('employee', 'name employeeCode department designation')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: payrolls });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPayroll,
    getPayrolls
};
