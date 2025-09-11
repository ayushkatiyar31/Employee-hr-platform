import React, { useState } from 'react';

const Header = ({ onNavigate, currentPage, onAddEmployee }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    
    const notifications = [
        { id: 1, message: 'New employee John Doe added', time: '2 hours ago', type: 'success' },
        { id: 2, message: 'Employee profile updated', time: '5 hours ago', type: 'info' },
        { id: 3, message: 'Monthly report generated', time: '1 day ago', type: 'warning' },
        { id: 4, message: 'System backup completed', time: '3 hours ago', type: 'success' },
        { id: 5, message: 'Database optimization finished', time: '6 hours ago', type: 'info' }
    ];
    
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
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
                <div className="d-flex justify-content-between align-items-center py-3">
                    <div className="d-flex align-items-center">
                        <div className="logo-container me-3">
                            <i className="bi bi-building-fill fs-2" style={{ color: '#f59e0b', animation: 'rotate 3s linear infinite' }}></i>
                        </div>
                        <div>
                            <h4 className="mb-0 text-white fw-bold">HRPro</h4>
                            <small className="text-light opacity-75">Employee Management System</small>
                        </div>
                    </div>
                    
                    <nav className="d-flex align-items-center gap-4">
                        <div 
                            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                            onClick={() => handleNavClick('dashboard')}
                        >
                            <i className="bi bi-house-fill me-2"></i>
                            <span>Dashboard</span>
                        </div>
                        <div 
                            className={`nav-item ${currentPage === 'employees' ? 'active' : ''}`}
                            onClick={() => handleNavClick('employees')}
                        >
                            <i className="bi bi-people-fill me-2"></i>
                            <span>Employees</span>
                        </div>
                        <div 
                            className="nav-item"
                            onClick={() => handleNavClick('add')}
                        >
                            <i className="bi bi-plus-circle-fill me-2"></i>
                            <span>Add Employee</span>
                        </div>
                        <div 
                            className={`nav-item ${currentPage === 'admin' ? 'active' : ''}`}
                            onClick={() => handleNavClick('admin')}
                        >
                            <i className="bi bi-gear-fill me-2"></i>
                            <span>Admin Panel</span>
                        </div>
                    </nav>
                    
                    <div className="d-flex align-items-center gap-3">
                        <div className="notification-icon" onClick={toggleNotifications}>
                            <i className="bi bi-bell-fill text-white fs-5"></i>
                            <span className="notification-badge">{notifications.length}</span>
                            
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
                        <div className="user-profile d-flex align-items-center">
                            <div className="user-avatar me-2">
                                <i className="bi bi-person-circle text-white fs-4"></i>
                            </div>
                            <div className="text-white">
                                <small className="d-block">Admin User</small>
                                <small className="opacity-75">admin@hrpro.com</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;