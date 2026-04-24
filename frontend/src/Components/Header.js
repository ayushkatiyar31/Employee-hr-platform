import React, { useState, useEffect, useRef } from 'react';

const Header = ({ onNavigate, currentPage, onAddEmployee, user }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserTooltip, setShowUserTooltip] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [viewedNotificationIds, setViewedNotificationIds] = useState(new Set());
    const notificationRef = useRef(null);
    const userTooltipRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userTooltipRef.current && !userTooltipRef.current.contains(event.target)) {
                setShowUserTooltip(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Update notifications every 10 seconds
    useEffect(() => {
        const updateNotifications = () => {
            const newNotifications = generateNotifications();
            setNotifications(newNotifications);
            setRefreshKey(prev => prev + 1);
        };
        
        updateNotifications();
        const interval = setInterval(updateNotifications, 2000);
        
        // Listen for data changes
        const handleDataUpdate = () => updateNotifications();
        window.addEventListener('dataUpdated', handleDataUpdate);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('dataUpdated', handleDataUpdate);
        };
    }, []);
    
    const generateNotifications = () => {
        const activities = [];
        const employees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
        const leaves = JSON.parse(localStorage.getItem('leaves') || '[]');
        const departments = JSON.parse(localStorage.getItem('departments') || '[]');
        
        const getTimeAgo = (timestamp) => {
            if (!timestamp) return null;
            const now = new Date();
            const created = new Date(timestamp);
            if (isNaN(created.getTime()) || created > now) return null;
            
            const diffMs = now - created;
            const diffSecs = Math.floor(diffMs / 1000);
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffDays > 7) return null;
            if (diffSecs < 10) return 'Just now';
            if (diffSecs < 60) return `${diffSecs}s ago`;
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            return `${diffDays}d ago`;
        };
        
        // Recent employees
        employees.forEach(emp => {
            const timeAgo = getTimeAgo(emp.createdAt);
            if (timeAgo) {
                activities.push({
                    id: `emp-${emp._id}`,
                    message: `Employee ${emp.name} added to ${emp.department}`,
                    time: timeAgo,
                    type: 'success',
                    timestamp: new Date(emp.createdAt)
                });
            }
        });
        
        // Recent leaves
        leaves.forEach(leave => {
            const timeAgo = getTimeAgo(leave.appliedDate);
            if (timeAgo) {
                activities.push({
                    id: `leave-${leave.id}`,
                    message: `${leave.employeeId} applied for ${leave.leaveType} leave`,
                    time: timeAgo,
                    type: leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'warning' : 'info',
                    timestamp: new Date(leave.appliedDate)
                });
            }
        });
        
        // Recent departments
        departments.forEach(dept => {
            const timeAgo = getTimeAgo(dept.createdAt);
            if (timeAgo) {
                activities.push({
                    id: `dept-${dept._id}`,
                    message: `Department '${dept.name}' created with manager ${dept.manager}`,
                    time: timeAgo,
                    type: 'info',
                    timestamp: new Date(dept.createdAt)
                });
            }
        });
        
        return activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };
    
    const toggleNotifications = () => {
        if (!showNotifications) {
            // Mark all current notifications as viewed
            const currentIds = new Set(notifications.map(n => n.id));
            setViewedNotificationIds(currentIds);
        }
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            setTimeout(() => setShowNotifications(false), 3000);
        }
    };
    
    const handleNavClick = (page) => {
        setShowNotifications(false);
        if (page === 'add') {
            onAddEmployee();
        } else {
            onNavigate(page);
        }
    };
    
    return (
        <header className="professional-header">
            <div className="container-fluid">
                <div className="d-flex align-items-center py-3" style={{ gap: '100px' }}>
                    <div className="d-flex align-items-center">
                        <div className="logo-container me-4">
                            <span style={{ fontSize: '1.5rem', animation: 'rotate 5s linear infinite', display: 'inline-block' }}>🏢</span>
                        </div>
                        <div>
                            <h4 className="mb-0 fw-bold" style={{ color: 'white' }}>HR Platform</h4>
                        </div>
                    </div>
                    
                    <nav className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
                        <div 
                            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                            onClick={() => handleNavClick('dashboard')}
                            style={{ marginRight: '0px' }}
                        >
                            <i className="bi bi-house-fill me-2" style={{ color: '#d2691e' }}></i>
                            <span>Dashboard</span>
                        </div>
                        <div 
                            className={`nav-item ${currentPage === 'employees' ? 'active' : ''}`}
                            onClick={() => handleNavClick('employees')}
                            style={{ marginRight: '0px' }}
                        >
                            <i className="bi bi-people-fill me-2" style={{ color: '#10b981' }}></i>
                            <span>Employees</span>
                        </div>
                        <div 
                            className={`nav-item ${currentPage === 'departments' ? 'active' : ''}`}
                            onClick={() => handleNavClick('departments')}
                        >
                            <i className="bi bi-building-fill me-2" style={{ color: '#a4d65e' }}></i>
                            <span>Departments</span>
                        </div>
                        <div 
                            className={`nav-item ${currentPage === 'leaves' ? 'active' : ''}`}
                            onClick={() => handleNavClick('leaves')}
                        >
                            <i className="bi bi-calendar-event-fill me-2" style={{ color: '#faf0e6' }}></i>
                            <span>Leave Management</span>
                        </div>

                        <div 
                            className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}
                            onClick={() => handleNavClick('reports')}
                            style={{ marginLeft: '20px' }}
                        >
                            <i className="bi bi-file-earmark-bar-graph-fill me-2" style={{ color: '#ef4444' }}></i>
                            <span>Reports</span>
                        </div>
                    </nav>
                    
                    <div className="d-flex align-items-center gap-3">
                        <div ref={notificationRef} className="notification-icon" onClick={toggleNotifications} style={{ marginRight: '40px', cursor: 'pointer' }}>
                            <i className="bi bi-bell-fill fs-5" style={{ color: 'white' }}></i>
                            {(() => {
                                const unviewedCount = notifications.filter(n => !viewedNotificationIds.has(n.id)).length;
                                return unviewedCount > 0 ? <span className="notification-badge">{unviewedCount}</span> : null;
                            })()}
                            
                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="p-3 border-bottom">
                                        <h6 className="mb-0 fw-bold">Notifications</h6>
                                    </div>
                                    {notifications.map(notification => (
                                        <div key={notification.id} className="notification-item">
                                            <div className="d-flex align-items-start">
                                                <i className={`bi bi-${notification.type === 'success' ? 'check-circle-fill text-success' : notification.type === 'info' ? 'info-circle-fill text-info' : 'exclamation-triangle-fill text-warning'} me-2 mt-1`}></i>
                                                <div className="flex-grow-1">
                                                    <p className="mb-1 small fw-semibold text-dark">{notification.message}</p>
                                                    <small className="text-muted">{notification.time}</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-2 text-center border-top">
                                        <small className="text-primary fw-semibold cursor-pointer">View all notifications</small>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div ref={userTooltipRef} className="user-profile d-flex align-items-center" style={{ position: 'relative' }}>
                            <div 
                                className="user-avatar me-2" 
                                style={{ position: 'relative', cursor: 'pointer' }}
                                onMouseEnter={() => setShowUserTooltip(true)}
                                onMouseLeave={() => setTimeout(() => setShowUserTooltip(false), 500)}
                            >
                                <i className="bi bi-person-circle fs-4" style={{ color: '#ff9500 !important', animation: 'rotateYZ 3s linear infinite' }}></i>
                            </div>
                            {showUserTooltip && (
                                <div 
                                    style={{
                                        position: 'absolute',
                                        top: '45px',
                                        right: '0',
                                        background: 'white',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                        zIndex: 1000,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    <div style={{ color: '#666', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>{user?.name || 'Admin User'}</div>
                                    <div style={{ color: '#000', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>{user?.role || 'admin'}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
