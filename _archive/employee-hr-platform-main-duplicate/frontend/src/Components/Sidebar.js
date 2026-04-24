import React from 'react';

const Sidebar = ({ collapsed, currentPage, onNavigate, onToggle, pageLoading }) => {
    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'employees', icon: '👥', label: 'Employees' },
        { id: 'leaves', icon: '📅', label: 'Leave Management' },
        { id: 'departments', icon: '🏢', label: 'Departments' },
        { id: 'reports', icon: '📈', label: 'Reports' },
        { id: 'settings', icon: '⚙️', label: 'Settings' }
    ];

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo" style={{animation: 'rotate 6s linear infinite', color: '#3b82f6', fontSize: '28px'}}>
                    🏢
                </div>
                {!collapsed && <h2 className="sidebar-title" style={{color: '#000000'}}>HR Platform</h2>}
            </div>

            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={`nav-item ${currentPage === item.id ? 'active' : ''} ${pageLoading ? 'loading' : ''}`}
                        onClick={() => onNavigate(item.id)}
                        disabled={pageLoading}
                    >
                        {pageLoading && currentPage === item.id ? (
                            <>
                                <div className="nav-shimmer"></div>
                                {!collapsed && <div className="nav-text-shimmer"></div>}
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                {!collapsed && <span style={{color: '#000000'}}>{item.label}</span>}
                            </>
                        )}
                    </button>
                ))}
            </nav>

            <div style={{ position: 'absolute', bottom: '20px', width: '100%', padding: '0 20px' }}>
                <button
                    className="nav-item"
                    style={{
                        background: '#ef4444',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        width: '60%',
                        margin: '0 auto',
                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                        e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                        e.target.style.transform = 'translateY(0) scale(1)';
                    }}
                    onClick={() => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        window.location.reload();
                    }}
                >
                    <span style={{ fontSize: '18px' }}>🚪</span>
                    {!collapsed && <span style={{color: 'white', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;