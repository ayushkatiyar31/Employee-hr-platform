const Employee = require('../Models/EmployeeModel');
const User = require('../Models/UserModel');

const buildEmployeeCode = () => `EMP-${Date.now().toString().slice(-6)}`;

const mapDocuments = (files = []) =>
    files.map((file) => ({
        name: file.originalname,
        url: file.path || file.secure_url || ''
    }));

const parseExistingDocuments = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.filter((item) => item && item.name && item.url);
    }

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.filter((item) => item && item.name && item.url) : [];
        } catch (error) {
            return [];
        }
    }

    return [];
};

const createEmployee = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            department,
            designation,
            salary,
            role,
            status,
            joiningDate,
            documents = []
        } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'employee',
            company: req.user.company || 'EmployeeHR',
            isActive: status ? status === 'active' : true
        });

        const employee = await Employee.create({
            user: user._id,
            employeeCode: buildEmployeeCode(),
            name,
            email,
            phone,
            department,
            designation,
            salary: Number(salary || 0),
            status: status || 'active',
            joiningDate: joiningDate || Date.now(),
            profileImage: req.files?.profileImage?.[0]?.path || '',
            documents: [
                ...parseExistingDocuments(documents),
                ...mapDocuments(req.files?.documents || [])
            ]
        });

        res.status(201).json({ success: true, data: employee });
    } catch (error) {
        next(error);
    }
};

const getAllEmployees = async (req, res, next) => {
    try {
        const { search = '', status, department } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) filter.status = status;
        if (department) filter.department = department;

        const employees = await Employee.find(filter)
            .populate('user', 'role isActive company')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: employees });
    } catch (error) {
        next(error);
    }
};

const getEmployeeById = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id).populate('user', 'role isActive');
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        next(error);
    }
};

const updateEmployeeById = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const updatePayload = {
            ...req.body
        };

        if (req.files?.profileImage?.[0]?.path) {
            updatePayload.profileImage = req.files.profileImage[0].path;
        }

        if (updatePayload.salary !== undefined) {
            updatePayload.salary = Number(updatePayload.salary);
        }

        const existingDocuments = parseExistingDocuments(updatePayload.existingDocuments);
        delete updatePayload.existingDocuments;
        delete updatePayload.documents;

        updatePayload.documents = [
            ...existingDocuments,
            ...mapDocuments(req.files?.documents || [])
        ];

        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, updatePayload, { new: true, runValidators: true });

        if (req.body.name || req.body.email) {
            await User.findByIdAndUpdate(employee.user, {
                ...(req.body.name ? { name: req.body.name } : {}),
                ...(req.body.email ? { email: req.body.email } : {})
            });
        }

        if (req.body.role || req.body.status) {
            await User.findByIdAndUpdate(employee.user, {
                ...(req.body.role ? { role: req.body.role } : {}),
                ...(req.body.status ? { isActive: req.body.status === 'active' } : {})
            });
        }

        res.status(200).json({ success: true, data: updatedEmployee });
    } catch (error) {
        next(error);
    }
};

const deleteEmployeeById = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        await User.findByIdAndDelete(employee.user);
        await employee.deleteOne();

        res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const getMyProfile = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user._id }).populate('user', 'name email role company');
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: employee._id,
                employeeCode: employee.employeeCode,
                name: employee.user?.name || employee.name,
                email: employee.user?.email || employee.email,
                role: employee.user?.role || 'employee',
                company: employee.user?.company || req.user.company,
                department: employee.department,
                designation: employee.designation,
                phone: employee.phone,
                address: employee.address,
                emergencyContact: employee.emergencyContact,
                joiningDate: employee.joiningDate,
                profileImage: employee.profileImage,
                documents: employee.documents,
                leaveBalance: employee.leaveBalance
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateMyProfile = async (req, res, next) => {
    try {
        const allowedFields = ['phone', 'address', 'emergencyContact'];
        const payload = allowedFields.reduce((acc, field) => {
            if (req.body[field] !== undefined) acc[field] = req.body[field];
            return acc;
        }, {});

        const employee = await Employee.findOneAndUpdate({ user: req.user._id }, payload, { new: true });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployeeById,
    deleteEmployeeById,
    getMyProfile,
    updateMyProfile
};
