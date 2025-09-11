import React from 'react';

const TopHeader = ({ collapsed, onToggleSidebar, currentPage, user, onSearch }) => {
    const getPageTitle = () => {
        switch (currentPage) {
            case 'dashboard': return 'Dashboard';
            case 'employees': return 'Employee Management';
            case 'departments': return 'Departments';
            case 'leaves': return 'Leave Management';
            case 'reports': return 'Reports';
            case 'settings': return 'Settings';
            default: return 'HR Platform';
        }
    };

    const getBreadcrumb = () => {
        switch (currentPage) {
            case 'dashboard': return 'Home / Dashboard';
            case 'employees': return 'Home / Employees';
            case 'departments': return 'Home / Departments';
            case 'leaves': return 'Home / Leave Management';
            case 'reports': return 'Home / Reports';
            case 'settings': return 'Home / Settings';
            default: return 'Home';
        }
    };

    return (
        <div className="top-header">
            <div className="header-left">
                <button className="toggle-sidebar" onClick={onToggleSidebar}>
                    <i className={`bi ${collapsed ? 'bi-list' : 'bi-x-lg'}`}></i>
                </button>
                <div>
                    <h1 className="page-title" style={{ fontSize: '20px', margin: 0 }}>{getPageTitle()}</h1>
                    <p className="breadcrumb">{getBreadcrumb()}</p>
                </div>
            </div>

            <div className="header-right">
                {currentPage === 'employees' && (
                    <div className="search-box">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Search employees..."
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                        />
                    </div>
                )}
                


                <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: collapsed ? 'none' : 'block', textAlign: 'right' }}>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
                            {user?.role || 'Employee'}
                        </div>
                    </div>
                    <div className="user-avatar" style={{ animation: 'rotateY 3s linear infinite', background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%)', color: 'white' }}>
                        {user?.avatar || user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={{ display: collapsed ? 'none' : 'block' }}>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
                            {user?.name || 'User'}
                        </div>
                    </div>
                    <i className="bi bi-chevron-down" style={{ fontSize: '12px', color: '#64748b' }}></i>
                </div>
            </div>
        </div>
    );
};

export default TopHeader;