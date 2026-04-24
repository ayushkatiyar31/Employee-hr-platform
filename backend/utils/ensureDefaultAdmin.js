const User = require('../Models/UserModel');

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@company.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'System Admin';
const DEFAULT_ADMIN_COMPANY = process.env.DEFAULT_ADMIN_COMPANY || 'EmployeeHR';

const ensureDefaultAdmin = async () => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }

    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).select('+password');

    if (!existingAdmin) {
        await User.create({
            name: DEFAULT_ADMIN_NAME,
            email: DEFAULT_ADMIN_EMAIL,
            password: DEFAULT_ADMIN_PASSWORD,
            role: 'admin',
            company: DEFAULT_ADMIN_COMPANY,
            isActive: true
        });
        console.log(`Default admin created: ${DEFAULT_ADMIN_EMAIL}`);
        return;
    }

    let needsUpdate = false;

    if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        needsUpdate = true;
    }

    if (!existingAdmin.isActive) {
        existingAdmin.isActive = true;
        needsUpdate = true;
    }

    if (existingAdmin.company !== DEFAULT_ADMIN_COMPANY) {
        existingAdmin.company = DEFAULT_ADMIN_COMPANY;
        needsUpdate = true;
    }

    const passwordMatches = await existingAdmin.comparePassword(DEFAULT_ADMIN_PASSWORD);
    if (!passwordMatches) {
        existingAdmin.password = DEFAULT_ADMIN_PASSWORD;
        needsUpdate = true;
    }

    if (needsUpdate) {
        await existingAdmin.save();
        console.log(`Default admin synced: ${DEFAULT_ADMIN_EMAIL}`);
    }
};

module.exports = ensureDefaultAdmin;
