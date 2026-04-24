const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
        },
        month: {
            type: String,
            required: true
        },
        basicSalary: {
            type: Number,
            required: true
        },
        allowances: {
            type: Number,
            default: 0
        },
        deductions: {
            type: Number,
            default: 0
        },
        netSalary: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['draft', 'generated', 'paid'],
            default: 'generated'
        },
        payslipUrl: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

payrollSchema.index({ employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
