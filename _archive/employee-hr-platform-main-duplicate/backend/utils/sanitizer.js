const sanitizeForLog = (input) => {
    if (typeof input !== 'string') {
        return String(input);
    }
    
    return input
        .replace(/[\r\n\t]/g, ' ')
        .replace(/[<>]/g, '')
        .substring(0, 200);
};

const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        return sanitizeForLog(obj);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeForLog(value);
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

module.exports = { sanitizeForLog, sanitizeObject };