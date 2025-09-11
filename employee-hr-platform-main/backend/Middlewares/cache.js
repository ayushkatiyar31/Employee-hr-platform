const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cacheMiddleware = (duration = CACHE_DURATION) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl;
        const cached = cache.get(key);

        if (cached && (Date.now() - cached.timestamp) < duration) {
            return res.json(cached.data);
        }

        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = function(data) {
            if (res.statusCode === 200) {
                cache.set(key, {
                    data,
                    timestamp: Date.now()
                });
            }
            return originalJson.call(this, data);
        };

        next();
    };
};

const clearCache = (pattern) => {
    if (pattern) {
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
    } else {
        cache.clear();
    }
};

module.exports = { cacheMiddleware, clearCache };
