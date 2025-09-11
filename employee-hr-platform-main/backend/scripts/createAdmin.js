const mongoose = require('mongoose');
const User = require('../Models/UserModel');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const existingAdmin = await User.findOne({ email: 'admin@company.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@company.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('Admin user created successfully:');
        console.log('Email: admin@company.com');
        console.log('Password: admin123');
        
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        mongoose.disconnect();
    }
};

createAdmin();