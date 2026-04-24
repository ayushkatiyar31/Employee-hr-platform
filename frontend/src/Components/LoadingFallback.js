import React, { useEffect, useState } from 'react';
import { checkBackendHealth, testAuthentication } from '../utils/healthCheck';

const LoadingFallback = ({ children, timeout = 1500 }) => {
  const [showFallback, setShowFallback] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to continue');
      } else {
        setError('Loading is taking longer than expected. Please check your connection.');
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  const handleRetry = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login
      window.location.reload();
      return;
    }
    setShowFallback(false);
    setForceRender(prev => prev + 1);
  };

  if (showFallback) {
    return (
      <div className="loading-fallback">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h3>{error ? 'Authentication Required' : 'Loading your dashboard...'}</h3>
          <p>{error || 'This is taking longer than expected'}</p>
          <button className="btn btn-primary" onClick={handleRetry}>
            {error ? 'Login' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return <div key={forceRender}>{children}</div>;
};

export default LoadingFallback;
