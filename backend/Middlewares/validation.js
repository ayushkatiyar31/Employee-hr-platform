const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

const validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

const validateRegister = [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol'),
    body('role').optional().isIn(['admin', 'hr', 'employee']).withMessage('Invalid role'),
    handleValidationErrors
];

const validateEmployee = [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('position').trim().notEmpty().withMessage('Position is required'),
    handleValidationErrors
];

const validateLeave = [
    body('employeeId').trim().notEmpty().withMessage('Employee name is required'),
    body('leaveType').isIn(['annual', 'sick', 'maternity', 'emergency']).withMessage('Invalid leave type'),
    body('reason').trim().isLength({ min: 10, max: 300 }).withMessage('Reason must be between 10 and 300 characters'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('startDate').custom((value) => {
        const startDate = new Date(value);
        const today = new Date();
        startDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            throw new Error('Start date cannot be in the past');
        }

        return true;
    }),
    body('endDate').custom((value, { req }) => {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);

        if (endDate < startDate) {
            throw new Error('End date cannot be earlier than start date');
        }

        const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        if (days > 60) {
            throw new Error('Leave duration cannot exceed 60 days');
        }

        return true;
    }),
    handleValidationErrors
];

module.exports = {
    validateLogin,
    validateRegister,
    validateEmployee,
    validateLeave,
    handleValidationErrors
};
