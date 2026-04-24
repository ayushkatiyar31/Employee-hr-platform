const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const Employee = require('../Models/EmployeeModel');

const buildEmployeeCode = () => `EMP-${Date.now().toString().slice(-6)}`;
const JWT_SECRET = process.env.JWT_SECRET || 'employeehr-dev-secret';

const signToken = (user) =>
    jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

const serializeUser = async (user) => {
    const employee = await Employee.findOne({ user: user._id }).lean();

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        company: user.company,
        avatar: user.avatar,
        employeeId: employee?._id || null,
        employeeCode: employee?.employeeCode || null,
        department: employee?.department || '',
        designation: employee?.designation || ''
    };
};

const register = async (req, res, next) => {
    try {
        const { name, email, password, company } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            company,
            role: 'employee'
        });

        await Employee.create({
            user: user._id,
            employeeCode: buildEmployeeCode(),
            name,
            email,
            department: 'General',
            designation: 'Employee'
        });

        res.status(201).json({
            success: true,
            message: 'Employee account created successfully',
            data: {
                user: await serializeUser(user),
                token: signToken(user)
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: await serializeUser(user),
                token: signToken(user)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: await serializeUser(req.user)
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    serializeUser
};
