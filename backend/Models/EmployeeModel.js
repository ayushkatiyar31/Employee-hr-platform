const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        employeeCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            default: ''
        },
        department: {
            type: String,
            required: true,
            trim: true
        },
        designation: {
            type: String,
            required: true,
            trim: true
        },
        joiningDate: {
            type: Date,
            default: Date.now
        },
        dateOfBirth: {
            type: Date
        },
        salary: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        address: {
            type: String,
            default: ''
        },
        emergencyContact: {
            type: String,
            default: ''
        },
        profileImage: {
            type: String,
            default: ''
        },
        documents: [
            {
                name: String,
                url: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        leaveBalance: {
            annual: { type: Number, default: 18 },
            sick: { type: Number, default: 10 },
            maternity: { type: Number, default: 90 },
            emergency: { type: Number, default: 5 }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Employee', employeeSchema);
