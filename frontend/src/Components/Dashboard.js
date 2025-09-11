import React, { useState, useEffect, useMemo } from 'react';

const Dashboard = (props) => {
    const { employeesData, onNavigate, onAddEmployee } = props;
    console.log('Dashboard props:', props);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        departments: {},
        avgSalary: 0,
        recentHires: 0,
        activeEmployees: 0
    });
    
    const [currentQuote, setCurrentQuote] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [showWelcome, setShowWelcome] = useState(true);
    const [activityRefresh, setActivityRefresh] = useState(0);
    const motivationalQuotes = [
        "Great leaders inspire greatness in others! 💪",
        "Success is a team sport - lead by example! 🌟",
        "Every employee matters, every decision counts! 🎯",
        "Build teams that build the future! 🚀"
    ];

    useEffect(() => {
        // Use cached stats if available for faster loading
        const cachedStats = sessionStorage.getItem('dashboardStats');
        if (cachedStats && !employeesData?.employees?.length) {
            setStats(JSON.parse(cachedStats));
        } else if (employeesData?.employees) {
            calculateStats(employeesData.employees);
        }
        
        // Auto-refresh dashboard data every 2 seconds
        const refreshInterval = setInterval(() => {
            const employees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
            calculateStats(employees);
        }, 2000);
        
        // Listen for localStorage changes
        const handleStorageChange = () => {
            const employees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
            calculateStats(employees);
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom events when data changes
        window.addEventListener('dataUpdated', handleStorageChange);
        
        return () => {
            clearInterval(refreshInterval);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('dataUpdated', handleStorageChange);
        };
    }, [employeesData]);
    
    useEffect(() => {
        const welcomeTimer = setTimeout(() => {
            setShowWelcome(false);
        }, 7000);
        return () => clearTimeout(welcomeTimer);
    }, []);
    
    useEffect(() => {
        const quoteInterval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
        }, 4000);
        return () => clearInterval(quoteInterval);
    }, []);
    
    // Refresh activity timestamps every 10 seconds
    useEffect(() => {
        const activityInterval = setInterval(() => {
            setActivityRefresh(prev => prev + 1);
        }, 10000);
        return () => clearInterval(activityInterval);
    }, []);
    
    useEffect(() => {
        const currentText = motivationalQuotes[currentQuote];
        setDisplayedText('');
        setIsTyping(true);
        
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < currentText.length) {
                setDisplayedText(currentText.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(typeInterval);
            }
        }, 80);
        
        return () => clearInterval(typeInterval);
    }, [currentQuote]);

    const calculateStats = (employees) => {
        const departments = {};
        let totalSalary = 0;
        let recentHires = 0;
        let activeEmployees = 0;

        // Group employees by department (case-insensitive)
        employees.forEach(emp => {
            if (emp.department) {
                const empDeptLower = emp.department.toLowerCase().trim();
                
                // Find if this department already exists (case-insensitive)
                let existingDeptName = null;
                for (const [deptName, count] of Object.entries(departments)) {
                    if (deptName.toLowerCase().trim() === empDeptLower) {
                        existingDeptName = deptName;
                        break;
                    }
                }
                
                if (existingDeptName) {
                    // Increment existing department
                    departments[existingDeptName]++;
                } else {
                    // Add new department with original spelling
                    departments[emp.department] = 1;
                }
            }
            
            totalSalary += parseFloat(emp.salary || 0);
            activeEmployees++;
            
            // Calculate recent hires based on creation date
            const hireDate = new Date(emp.createdAt || Date.now());
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            if (hireDate > thirtyDaysAgo) recentHires++;
        });

        const newStats = {
            totalEmployees: employees.length,
            departments,
            avgSalary: employees.length ? Math.round(totalSalary / employees.length) : 0,
            recentHires,
            activeEmployees
        };
        
        setStats(newStats);
        // Cache stats for faster subsequent loads
        sessionStorage.setItem('dashboardStats', JSON.stringify(newStats));
    };
    
    const generateRecentActivity = useMemo(() => {
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
            if (diffSecs < 60) return `${diffSecs} seconds ago`;
            if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        };
        
        // Add recent employee activities only
        employees.forEach((emp) => {
            const empTime = getTimeAgo(emp.createdAt);
            if (empTime) {
                activities.push({
                    icon: 'bi-person-plus',
                    text: `Employee ${emp.name} added to ${emp.department}`,
                    time: empTime,
                    color: '#10b981',
                    timestamp: new Date(emp.createdAt)
                });
            }
            
            if (emp.status === 'on-leave') {
                const statusTime = getTimeAgo(emp.updatedAt || emp.createdAt);
                if (statusTime) {
                    activities.push({
                        icon: 'bi-calendar-x',
                        text: `${emp.name} status changed to on-leave`,
                        time: statusTime,
                        color: '#f59e0b',
                        timestamp: new Date(emp.updatedAt || emp.createdAt)
                    });
                }
            }
        });
        
        // Add recent leave activities only
        leaves.forEach((leave) => {
            const leaveTime = getTimeAgo(leave.appliedDate);
            if (leaveTime) {
                activities.push({
                    icon: 'bi-calendar-plus',
                    text: `${leave.employeeId} applied for ${leave.leaveType} leave`,
                    time: leaveTime,
                    color: '#3b82f6',
                    timestamp: new Date(leave.appliedDate)
                });
            }
            
            if (leave.status === 'approved') {
                const approveTime = getTimeAgo(leave.statusUpdatedAt || leave.appliedDate);
                if (approveTime) {
                    activities.push({
                        icon: 'bi-check-circle',
                        text: `Leave request by ${leave.employeeId} approved`,
                        time: approveTime,
                        color: '#10b981',
                        timestamp: new Date(leave.statusUpdatedAt || leave.appliedDate)
                    });
                }
            }
        });
        
        // Add recent department activities only
        departments.forEach((dept) => {
            const deptTime = getTimeAgo(dept.createdAt);
            if (deptTime) {
                activities.push({
                    icon: 'bi-building',
                    text: `Department '${dept.name}' created with manager ${dept.manager}`,
                    time: deptTime,
                    color: '#8b5cf6',
                    timestamp: new Date(dept.createdAt)
                });
            }
        });
        
        // Add system activity only if no other activities
        if (activities.length === 0) {
            activities.push({
                icon: 'bi-graph-up',
                text: 'No recent activities',
                time: 'Just now',
                color: '#6b7280',
                timestamp: new Date()
            });
        }
        
        // Sort by timestamp (most recent first) and limit to 6 items
        return activities
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 6);
    }, [employeesData?.employees, activityRefresh]);

    const StatCard = ({ icon, title, value, iconClass, trend, trendPositive = true }) => (
        <div className="stat-card">
            <div className="stat-card-header">
                <h3 className="stat-card-title">{title}</h3>
                <div className={`stat-card-icon ${iconClass}`}>
                    <i className={`bi ${icon}`}></i>
                </div>
            </div>
            <h2 className="stat-card-value">{value}</h2>
            {trend && (
                <div className={`stat-card-change ${trendPositive ? 'positive' : 'negative'}`}>
                    <i className={`bi ${trendPositive ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                    {trend} from last month
                </div>
            )}
        </div>
    );

    const QuickActionCard = ({ icon, title, onClick }) => (
        <div className="quick-action-btn" onClick={onClick}>
            <div className="quick-action-icon">
                <i className={`bi ${icon}`}></i>
            </div>
            <h4 className="quick-action-title">{title}</h4>
        </div>
    );

    const handleQuickAction = (action) => {
        console.log('Quick action clicked:', action);
        console.log('Props received:', props);
        
        switch(action) {
            case 'add-employee':
                if (onAddEmployee) {
                    onAddEmployee();
                } else {
                    // Fallback: try to find and click add employee button
                    const addBtn = document.querySelector('.add-btn');
                    if (addBtn) {
                        addBtn.click();
                    } else {
                        alert('Opening Add Employee form...');
                    }
                }
                break;
            case 'generate-report':
                if (props.onGenerateReport) {
                    props.onGenerateReport();
                } else {
                    alert('Opening Generate Report form...');
                }
                break;
            case 'schedule-meeting':
                if (props.onLeaveForm) {
                    props.onLeaveForm();
                } else {
                    alert('Opening Leave Form...');
                }
                break;
            case 'settings':
                if (onNavigate) {
                    onNavigate('reports');
                } else {
                    alert('Opening Reports...');
                }
                break;
            default:
                console.log('Unknown quick action:', action);
        }
    };


    return (
        <>
            <div style={{
                position: 'fixed',
                top: showWelcome ? 0 : '-100vh',
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundImage: 'url(/hr-human-resources-management-recruitment-talent-concept-191662855.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'top 2s ease-out'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    perspective: '1000px',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '40px 60px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    opacity: 0,
                    animation: 'fadeInBox 0.5s ease-out 1.5s forwards'
                }}>
                    <div style={{
                        color: '#ffffff',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        textShadow: '4px 4px 8px rgba(0,0,0,1), 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(0,150,255,0.8)',
                        animation: 'movieTitle 4s ease-out 1.5s forwards',
                        opacity: 0,
                        transform: 'rotateX(45deg) translateZ(100px)',
                        letterSpacing: '3px',
                        WebkitTextStroke: '2px rgba(0,150,255,0.5)'
                    }}>
                        WELCOME TO
                    </div>
                    <div style={{
                        color: '#00ff88',
                        fontSize: '64px',
                        fontWeight: 'bold',
                        textShadow: '4px 4px 8px rgba(0,0,0,1), 0 0 30px rgba(0,255,136,1), 0 0 60px rgba(0,255,136,0.6)',
                        animation: 'movieTitle 4s ease-out 2.5s forwards',
                        opacity: 0,
                        transform: 'rotateX(45deg) translateZ(150px)',
                        letterSpacing: '5px',
                        marginTop: '10px',
                        WebkitTextStroke: '2px rgba(0,255,136,0.5)'
                    }}>
                        HR PLATFORM
                    </div>
                </div>
            </div>
            
            <div className="dashboard-container" style={{ 
                position: showWelcome ? 'fixed' : 'relative',
                top: showWelcome ? '100vh' : '0',
                left: showWelcome ? 0 : 'auto',
                width: showWelcome ? '100vw' : '100%',
                height: showWelcome ? 'calc(100vh - 70px)' : '100%',
                maxWidth: 'none',
                zIndex: showWelcome ? 9998 : 'auto',
                transition: 'top 2s ease-out',
                overflowY: 'auto',
                padding: '0 20px',
                boxSizing: 'border-box'
            }}>




            {/* Quick Actions */}
            <div style={{ marginBottom: '24px', background: '#1f2937', border: 'none', borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-header" style={{ background: '#1f2937', border: 'none', borderBottom: 'none' }}>
                    <h3 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '600', margin: '0', display: 'flex', alignItems: 'center' }}>
                        <i className="bi bi-lightning-fill me-2" style={{ color: '#ffffff', fontSize: '24px' }}></i>
                        Quick Actions
                    </h3>
                </div>
                <div className="card-body" style={{ background: '#1f2937', border: 'none', borderTop: 'none', borderBottom: 'none' }}>
                    <div className="quick-actions">
                        <button onClick={() => handleQuickAction('add-employee')} style={{background: 'linear-gradient(145deg, #6366f1, #3b82f6, #1e40af, #1e3a8a)', color: 'white', border: 'none', borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'all 0.2s ease', boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'}} onMouseEnter={(e) => {e.target.style.transform = 'translateY(-5px) scale(1.05)'; e.target.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.3)';}} onMouseLeave={(e) => {e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)';}}>
                            <div style={{fontSize: '32px', animation: 'rotateY 3s linear infinite', filter: 'brightness(1.5) saturate(1.8)'}}>
                                👥
                            </div>
                            <h4 style={{color: 'white', margin: '0', fontSize: '14px', fontWeight: '600'}}>Add Employee</h4>
                        </button>
                        <button onClick={() => handleQuickAction('generate-report')} style={{background: 'linear-gradient(145deg, #22c55e, #10b981, #059669, #047857)', color: 'white', border: 'none', borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'all 0.2s ease', boxShadow: '0 12px 35px rgba(16, 185, 129, 0.5), inset 0 3px 0 rgba(255, 255, 255, 0.4), inset 0 -3px 0 rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.3)'}} onMouseEnter={(e) => {e.target.style.transform = 'translateY(-5px) scale(1.05)'; e.target.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.3)';}} onMouseLeave={(e) => {e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'}}>
                            <div style={{fontSize: '32px', animation: 'rotateY 3s linear infinite', filter: 'brightness(1.5) saturate(1.8)'}}>
                                📊
                            </div>
                            <h4 style={{color: 'white', margin: '0', fontSize: '14px', fontWeight: '600'}}>Generate Report</h4>
                        </button>
                        <button onClick={() => handleQuickAction('schedule-meeting')} style={{background: 'linear-gradient(145deg, #f59e0b, #d97706, #b45309, #92400e)', color: 'white', border: 'none', borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'all 0.2s ease', boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'}} onMouseEnter={(e) => {e.target.style.transform = 'translateY(-5px) scale(1.05)'; e.target.style.boxShadow = '0 15px 40px rgba(245, 158, 11, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.3)';}} onMouseLeave={(e) => {e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'}}>
                            <div style={{fontSize: '32px', animation: 'rotateY 3s linear infinite', filter: 'brightness(1.5) saturate(1.8)'}}>
                                📅
                            </div>
                            <h4 style={{color: 'white', margin: '0', fontSize: '14px', fontWeight: '600'}}>Leave Management</h4>
                        </button>
                        <button onClick={() => handleQuickAction('settings')} style={{background: 'linear-gradient(145deg, #a855f7, #8b5cf6, #7c3aed, #6d28d9)', color: 'white', border: 'none', borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'all 0.2s ease', boxShadow: '0 12px 35px rgba(139, 92, 246, 0.5), inset 0 3px 0 rgba(255, 255, 255, 0.4), inset 0 -3px 0 rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)'}} onMouseEnter={(e) => {e.target.style.transform = 'translateY(-5px) scale(1.05)'; e.target.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.3)';}} onMouseLeave={(e) => {e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'}}>
                            <div style={{fontSize: '32px', animation: 'rotateY 3s linear infinite', filter: 'brightness(1.5) saturate(1.8)'}}>
                                🔄
                            </div>
                            <h4 style={{color: 'white', margin: '0', fontSize: '14px', fontWeight: '600'}}>Updates</h4>
                        </button>
                    </div>
                </div>
            </div>
            {/* Charts and Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', width: '100%' }}>
                {/* Department Distribution */}
                <div className="modern-card dark-card">
                    <div className="card-header">
                        <h3 className="card-title" style={{ color: 'white' }}>
                            <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '18px' }}>📊</span>
                            Department Distribution
                        </h3>
                    </div>
                    <div className="card-body" style={{ background: '#1f2937 !important' }}>
                        <div className="department-chart auto-hide-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {Object.entries(stats.departments).map(([dept, count], index) => (
                                <div key={dept} className="d-flex justify-content-between align-items-center mb-3 p-3" 
                                     style={{ background: '#787d8c', borderRadius: '8px' }}>
                                    <div className="d-flex align-items-center">
                                        <div 
                                            style={{ 
                                                backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                marginRight: '12px'
                                            }}
                                        ></div>
                                        <span style={{ fontWeight: '500', color: 'white' }}>{dept}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span style={{ fontWeight: '600', color: 'white', marginRight: '12px' }}>{count}</span>
                                        <div style={{
                                            width: '60px',
                                            height: '6px',
                                            backgroundColor: '#1f2937',
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${(count / stats.totalEmployees) * 100}%`,
                                                height: '100%',
                                                backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                                                borderRadius: '3px'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="modern-card dark-card">
                    <div className="card-header">
                        <h3 className="card-title" style={{ color: 'white' }}>
                            <span style={{ color: '#10b981', marginRight: '8px', fontSize: '18px' }}>📈</span>
                            Recent Activity
                        </h3>
                    </div>
                    <div className="card-body" style={{ background: '#1f2937 !important' }}>
                        <div className="activity-list auto-hide-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {generateRecentActivity.map((activity, index) => (
                                <div key={index} className="d-flex align-items-center mb-3 p-3" 
                                     style={{ background: '#6b7280', borderRadius: '8px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: activity.color,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px'
                                    }}>
                                        <i className={`bi ${activity.icon}`} style={{ color: 'white' }}></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <p style={{ margin: 0, fontWeight: '500', color: 'white' }}>{activity.text}</p>
                                        <small style={{ color: 'white' }}>{activity.time}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
};

export default Dashboard;
