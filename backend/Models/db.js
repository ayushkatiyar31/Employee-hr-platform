const mongoose = require('mongoose');

const mongo_url = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_hr_platform';

mongoose.connect(mongo_url)
    .then(() => {
        console.log('MongoDB Connected to:', mongo_url.replace(/\/\/.*@/, '//***:***@'))
    }).catch((err) => {
        console.log('Error while MongoDB connecting ...', err);
    })