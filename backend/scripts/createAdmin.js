const mongoose = require('mongoose');
require('dotenv').config();
const ensureDefaultAdmin = require('../utils/ensureDefaultAdmin');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_hr_platform');
        await ensureDefaultAdmin();

        console.log('Default admin is ready:');
        console.log(`Email: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@company.com'}`);
        console.log(`Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
        
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        mongoose.disconnect();
    }
};

createAdmin();
