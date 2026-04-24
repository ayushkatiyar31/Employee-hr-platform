import React, { useEffect, useMemo, useRef, useState } from 'react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
    { id: 'employees', label: 'Employees', icon: 'bi-people-fill' },
    { id: 'departments', label: 'Departments', icon: 'bi-building-fill' },
    { id: 'leaves', label: 'Leave', icon: 'bi-calendar2-week-fill' },
    { id: 'reports', label: 'Reports', icon: 'bi-bar-chart-line-fill' }
];

const iconPalette = {
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6'
};

const Header = ({ onNavigate, currentPage, user }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [viewedIds, setViewedIds] = useState(new Set());
    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const refreshNotifications = () => {
            const employees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
            const leaves = JSON.parse(localStorage.getItem('leaves') || '[]');
            const departments = JSON.parse(localStorage.getItem('departments') || '[]');

            const recentItems = [];

            const getTimeAgo = (timestamp) => {
                if (!timestamp) return null;
                const now = new Date();
                const created = new Date(timestamp);
                if (Number.isNaN(created.getTime()) || created > now) return null;

                const diffMinutes = Math.floor((now - created) / (1000 * 60));
                if (diffMinutes < 1) return 'Just now';
                if (diffMinutes < 60) return `${diffMinutes}m ago`;
                const diffHours = Math.floor(diffMinutes / 60);
                if (diffHours < 24) return `${diffHours}h ago`;
                const diffDays = Math.floor(diffHours / 24);
                return diffDays > 7 ? null : `${diffDays}d ago`;
            };

            employees.forEach((employee) => {
                const time = getTimeAgo(employee.createdAt);
                if (time) {
                    recentItems.push({
                        id: `employee-${employee._id}`,
                        type: 'success',
                        icon: 'bi-person-plus-fill',
                        message: `${employee.name} joined ${employee.department}`,
                        time,
                        timestamp: new Date(employee.createdAt)
                    });
                }
            });

            leaves.forEach((leave) => {
                const time = getTimeAgo(leave.appliedDate);
                if (time) {
                    recentItems.push({
                        id: `leave-${leave.id}`,
                        type: leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'warning' : 'info',
                        icon: 'bi-calendar-check-fill',
                        message: `${leave.employeeId} requested ${leave.leaveType} leave`,
                        time,
                        timestamp: new Date(leave.appliedDate)
                    });
                }
            });

            departments.forEach((department) => {
                const time = getTimeAgo(department.createdAt);
                if (time) {
                    recentItems.push({
                        id: `department-${department._id}`,
                        type: 'info',
                        icon: 'bi-diagram-3-fill',
                        message: `${department.name} department was created`,
                        time,
                        timestamp: new Date(department.createdAt)
                    });
                }
            });

            setNotifications(
                recentItems
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 8)
            );
        };

        refreshNotifications();
        const interval = setInterval(refreshNotifications, 3000);
        window.addEventListener('dataUpdated', refreshNotifications);

        return () => {
            clearInterval(interval);
            window.removeEventListener('dataUpdated', refreshNotifications);
        };
    }, []);

    const unseenCount = useMemo(
        () => notifications.filter((item) => !viewedIds.has(item.id)).length,
        [notifications, viewedIds]
    );

    const handleNotificationToggle = () => {
        if (!showNotifications) {
            setViewedIds(new Set(notifications.map((item) => item.id)));
        }
        setShowNotifications((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.reload();
    };

    return (
        <header className="workspace-topbar">
            <div className="workspace-topbar-inner">
                <div className="workspace-brand">
                    <div className="workspace-brand-mark">
                        <i className="bi bi-buildings-fill"></i>
                    </div>
                    <div>
                        <h1 className="workspace-brand-title">PulseHR Workspace</h1>
                        <p className="workspace-brand-subtitle">A cleaner operations hub for people, leave, and reporting.</p>
                    </div>
                </div>

                <nav className="workspace-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`workspace-nav-item ${currentPage === item.id ? 'active' : ''}`}
                            onClick={() => onNavigate(item.id)}
                        >
                            <i className={`bi ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="workspace-toolbar">
                    <div className="workspace-notification-wrap" ref={notificationRef}>
                        <button type="button" className="workspace-icon-button" onClick={handleNotificationToggle}>
                            <i className="bi bi-bell-fill"></i>
                        </button>
                        {unseenCount > 0 && <span className="workspace-badge">{unseenCount}</span>}
                        {showNotifications && (
                            <div className="workspace-dropdown">
                                <div className="workspace-dropdown-header">
                                    <strong>Recent activity</strong>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                                        Live updates from employees, leave requests, and departments.
                                    </div>
                                </div>
                                <div className="workspace-dropdown-body">
                                    {notifications.length === 0 ? (
                                        <div className="workspace-dropdown-item" style={{ color: '#64748b' }}>
                                            No recent activity yet.
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div key={notification.id} className="workspace-dropdown-item">
                                                <div
                                                    className="workspace-dropdown-icon"
                                                    style={{ background: iconPalette[notification.type] || iconPalette.info }}
                                                >
                                                    <i className={`bi ${notification.icon}`}></i>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                                                        {notification.message}
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '3px' }}>
                                                        {notification.time}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="workspace-user-chip" ref={userMenuRef}>
                        <div className="workspace-user-avatar">
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="workspace-user-meta">
                            <span className="workspace-user-name">{user?.name || 'Team Member'}</span>
                            <span className="workspace-user-role">{user?.role || 'admin'}</span>
                        </div>
                        <button
                            type="button"
                            className="workspace-icon-button"
                            style={{ width: '38px', height: '38px', borderRadius: '12px' }}
                            onClick={() => setShowUserMenu((prev) => !prev)}
                        >
                            <i className="bi bi-chevron-down"></i>
                        </button>

                        {showUserMenu && (
                            <div className="workspace-dropdown" style={{ width: '250px', right: 0 }}>
                                <div className="workspace-dropdown-header">
                                    <strong>{user?.name || 'Team Member'}</strong>
                                    <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '3px' }}>
                                        {user?.email || 'Local workspace session'}
                                    </div>
                                </div>
                                <div className="workspace-dropdown-body">
                                    <div className="workspace-dropdown-item" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>Role</div>
                                            <div style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'capitalize' }}>
                                                {user?.role || 'admin'}
                                            </div>
                                        </div>
                                        <span className="workspace-pill active">Online</span>
                                    </div>
                                    <div className="workspace-dropdown-item">
                                        <button type="button" className="workspace-button-danger" style={{ width: '100%' }} onClick={handleLogout}>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
