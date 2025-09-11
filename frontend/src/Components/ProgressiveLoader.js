import React, { useState, useEffect } from 'react';

const ProgressiveLoader = ({ children, fallback, delay = 200 }) => {
    const [showFallback, setShowFallback] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFallback(false);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return showFallback ? fallback : children;
};

export default ProgressiveLoader;
