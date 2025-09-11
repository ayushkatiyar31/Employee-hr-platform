const crypto = require('crypto');

// Simple CSRF token generation and validation
const csrfTokens = new Map();

const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET requests and auth endpoints
    if (req.method === 'GET' || req.path.includes('/auth/')) {
        return next();
    }

    const token = req.headers['x-csrf-token'];
    const sessionId = req.headers['x-session-id'] || req.ip;

    if (!token || !csrfTokens.has(sessionId) || csrfTokens.get(sessionId) !== token) {
        return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
    }

    next();
};

const getCSRFToken = (req, res) => {
    const sessionId = req.headers['x-session-id'] || req.ip;
    const token = generateCSRFToken();
    
    // Store token with 1 hour expiry
    csrfTokens.set(sessionId, token);
    setTimeout(() => csrfTokens.delete(sessionId), 3600000);

    res.json({
        success: true,
        csrfToken: token
    });
};

module.exports = { csrfProtection, getCSRFToken };
