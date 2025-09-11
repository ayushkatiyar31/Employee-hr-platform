import { useEffect, useRef, useState } from 'react';

export const usePerformance = (componentName) => {
    const startTime = useRef(Date.now());
    
    useEffect(() => {
        const endTime = Date.now();
        const renderTime = endTime - startTime.current;
        
        if (renderTime > 100) { // Log slow renders
            console.warn(`${componentName} took ${renderTime}ms to render`);
        }
        
        return () => {
            startTime.current = Date.now();
        };
    });
};

export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
};

export const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef(null);
    
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);
        
        if (targetRef.current) {
            observer.observe(targetRef.current);
        }
        
        return () => {
            if (targetRef.current) {
                observer.unobserve(targetRef.current);
            }
        };
    }, [options]);
    
    return [targetRef, isIntersecting];
};