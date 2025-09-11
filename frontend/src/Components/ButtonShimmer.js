import React from 'react';

// Button Shimmer Component
export const ButtonShimmer = ({ width = '100%', height = '40px', className = '' }) => (
  <div 
    className={`shimmer ${className}`} 
    style={{ 
      width, 
      height, 
      borderRadius: '8px',
      display: 'inline-block'
    }}
  ></div>
);

// Navigation Button Shimmer
export const NavButtonShimmer = ({ collapsed = false }) => (
  <div className="nav-item loading">
    <div className="nav-shimmer"></div>
    {!collapsed && <div className="nav-text-shimmer"></div>}
  </div>
);

// Quick Action Button Shimmer
export const QuickActionShimmer = () => (
  <div className="quick-action-btn shimmer-loading">
    <div className="quick-action-icon shimmer" style={{ width: '48px', height: '48px', borderRadius: '12px' }}></div>
    <div className="shimmer" style={{ width: '80%', height: '16px', margin: '12px auto 0', borderRadius: '4px' }}></div>
  </div>
);

// Form Button Shimmer
export const FormButtonShimmer = ({ variant = 'primary' }) => (
  <button className={`btn btn-${variant} shimmer-btn`} disabled>
    <div className="shimmer" style={{ width: '60px', height: '16px', borderRadius: '4px' }}></div>
  </button>
);

export default ButtonShimmer;
