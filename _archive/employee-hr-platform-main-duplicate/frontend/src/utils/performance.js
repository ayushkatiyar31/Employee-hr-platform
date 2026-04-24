// Performance optimization utilities

// Debounce function for search inputs
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

// Memory cleanup utility
export const cleanupMemory = () => {
    // Clear expired cache entries
    const now = Date.now();
    const keys = Object.keys(sessionStorage);
    
    keys.forEach(key => {
        if (key.endsWith('_time')) {
            const timestamp = parseInt(sessionStorage.getItem(key));
            if (now - timestamp > 300000) { // 5 minutes
                const dataKey = key.replace('_time', '');
                sessionStorage.removeItem(key);
                sessionStorage.removeItem(dataKey);
            }
        }
    });
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
    return async (...args) => {
        const start = performance.now();
        const result = await fn(...args);
        const end = performance.now();
        
        if (end - start > 100) {
            console.warn(`${name} took ${end - start} milliseconds`);
        }
        
        return result;
    };
};

// Preload critical resources
export const preloadResources = () => {
    const criticalResources = [
        '/static/css/main.css',
        '/static/js/bundle.js'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
    // Clean up memory on page load
    cleanupMemory();
    
    // Preload critical resources
    preloadResources();
    
    // Set up periodic cleanup
    setInterval(cleanupMemory, 60000); // Every minute
    
    // Add performance observer
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.duration > 100) {
                    console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
                }
            });
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
};