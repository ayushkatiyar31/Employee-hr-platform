const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const EmployeeRoutes = require('./Routes/EmployeeRoutes');
const LeaveRoutes = require('./Routes/LeaveRoutes');
const AuthRoutes = require('./Routes/AuthRoutes');
const errorHandler = require('./Middlewares/errorHandler');
const { csrfProtection, getCSRFToken } = require('./Middlewares/csrf');

require('dotenv').config();
require('./Models/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for specific origins
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://jocular-cat-42520b.netlify.app',
        'https://employee-hr-platform-1.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    credentials: false
}));

// Additional CORS headers
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'https://jocular-cat-42520b.netlify.app',
        'https://employee-hr-platform-1.onrender.com'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.'
    }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

app.use(compression());
app.use(bodyParser.json());

// CSRF Protection - Disabled for now
// app.get('/api/csrf-token', getCSRFToken);
// app.use('/api', csrfProtection);

app.use('/api/auth', AuthRoutes);
app.use('/api/employees', EmployeeRoutes);
app.use('/api/leaves', LeaveRoutes);

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Employee Management System API is running!',
        timestamp: new Date().toISOString(),
        status: 'healthy',
        version: '1.0.0'
    });
});

// Detailed health check
app.get('/health', (req, res) => {
    const healthCheck = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    };
    
    res.json(healthCheck);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log('Unhandled Rejection:', err.message);
    server.close(() => {
        process.exit(1);
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/`);
});