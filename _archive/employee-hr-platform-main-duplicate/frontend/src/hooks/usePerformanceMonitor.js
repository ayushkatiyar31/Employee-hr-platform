import { useEffect } from 'react';

export const usePerformanceMonitor = (componentName) => {
    useEffect(() => {
        const startTime = performance.now();
        
        return () => {
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            if (renderTime > 100) { // Log slow renders
                console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
            }
        };
    }, [componentName]);
};

export const measureApiCall = async (apiCall, operationName) => {
    const startTime = performance.now();
    
    try {
        const result = await apiCall();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`API ${operationName} completed in ${duration.toFixed(2)}ms`);
        return result;
    } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.error(`API ${operationName} failed after ${duration.toFixed(2)}ms:`, error.message);
        throw error;
    }
};