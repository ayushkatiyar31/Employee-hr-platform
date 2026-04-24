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
    }, [employeesData]);
    
    useEffect(() => {
        const quoteInterval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
        }, 4000);
        return () => clearInterval(quoteInterval);
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

        employees.forEach(emp => {
            departments[emp.department] = (departments[emp.department] || 0) + 1;
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
        const employees = employeesData?.employees || [];
        
        if (employees.length > 0) {
            // Add recent employee additions
            employees.slice(-2).forEach((emp, index) => {
                activities.push({
                    icon: 'bi-person-plus',
                    text: `New employee ${emp.name} added to ${emp.department}`,
                    time: `${index + 1} hour${index > 0 ? 's' : ''} ago`,
                    color: '#10b981'
                });
            });
            
            // Add profile updates
            if (employees.length > 1) {
                const randomEmployee = employees[0]; // Use first employee instead of random to prevent re-renders
                activities.push({
                    icon: 'bi-pencil',
                    text: `${randomEmployee.name}'s profile updated`,
                    time: '3 hours ago',
                    color: '#3b82f6'
                });
            }
        }
        
        // Add system activities
        activities.push(
            {
                icon: 'bi-file-text',
                text: 'Monthly report generated',
                time: '1 day ago',
                color: '#f59e0b'
            },
            {
                icon: 'bi-graph-up',
                text: 'Analytics dashboard updated',
                time: '2 days ago',
                color: '#8b5cf6'
            }
        );
        
        return activities.slice(0, 4);
    }, [employeesData?.employees]);

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
                if (onNavigate) {
                    onNavigate('reports');
                } else {
                    // Fallback: try to find and click reports button
                    const reportsBtn = document.querySelector('.reports-btn');
                    if (reportsBtn) {
                        reportsBtn.click();
                    } else {
                        alert('Opening Reports section...');
                    }
                }
                break;
            case 'schedule-meeting':
                if (onNavigate) {
                    onNavigate('leaves');
                } else {
                    alert('Opening Leave Management...');
                }
                break;
            case 'settings':
                if (onNavigate) {
                    onNavigate('settings');
                } else {
                    alert('Opening Settings...');
                }
                break;
            default:
                console.log('Unknown quick action:', action);
        }
    };


    return (
        <div className="dashboard-container">
            {/* Hero Section */}
            <div className="dashboard-hero" style={{
                background: 'linear-gradient(145deg, #2d3748, #4a5568, #a0aec0, #d69e2e, #c05621)',
                borderRadius: '20px',
                padding: '40px',
                margin: '20px 0',
                boxShadow: '0 20px 60px rgba(45, 55, 72, 0.4), inset 0 4px 0 rgba(255, 255, 255, 0.3), inset 0 -4px 0 rgba(0, 0, 0, 0.2), 0 0 40px rgba(214, 158, 46, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    animation: 'rotate 20s linear infinite'
                }}></div>
                <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ 
                        fontSize: '18px', 
                        color: 'white', 
                        textAlign: 'left', 
                        marginBottom: '20px',
                        fontWeight: '600',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        transition: 'all 0.5s ease',
                        minHeight: '25px',
                        animation: 'slideInLeft 0.8s ease-out'
                    }}>
                        {displayedText}
                        {isTyping && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
                    </div>
                    <h1 className="hero-title" style={{ color: 'white', textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>Ready to Lead? 🏆</h1>
                    <p className="hero-subtitle" style={{ color: '#ffffff', textShadow: '0 6px 12px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)', fontWeight: '600', filter: 'brightness(1.2)' }}>Your team's success starts with smart decisions - let's make today count!</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <StatCard 
                    icon="bi-people-fill" 
                    title="Total Employees" 
                    value={stats.totalEmployees}
                    iconClass="primary"
                    trend="+12%"
                />
                <StatCard 
                    icon="bi-person-check-fill" 
                    title="Active Employees" 
                    value={stats.activeEmployees}
                    iconClass="success"
                    trend="+8%"
                />
                <StatCard 
                    icon="bi-building-fill" 
                    title="Departments" 
                    value={Object.keys(stats.departments).length}
                    iconClass="info"
                    trend="+2"
                />
                <StatCard 
                    icon="bi-person-plus-fill" 
                    title="New Hires" 
                    value={stats.recentHires}
                    iconClass="warning"
                    trend="+15%"
                />
            </div>

            {/* Quick Actions */}
            <div className="modern-card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <h3 className="card-title">
                        <i className="bi bi-lightning-fill me-2"></i>
                        Quick Actions
                    </h3>
                </div>
                <div className="card-body">
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
                                ⚙️
                            </div>
                            <h4 style={{color: 'white', margin: '0', fontSize: '14px', fontWeight: '600'}}>Settings</h4>
                        </button>
                    </div>
                </div>
            </div>
            {/* Charts and Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Department Distribution */}
                <div className="modern-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="bi bi-pie-chart-fill me-2" style={{ color: '#f59e0b' }}></i>
                            Department Distribution
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="department-chart">
                            {Object.entries(stats.departments).map(([dept, count], index) => (
                                <div key={dept} className="d-flex justify-content-between align-items-center mb-3 p-3" 
                                     style={{ background: '#f8fafc', borderRadius: '8px' }}>
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
                                        <span style={{ fontWeight: '500', color: '#1e293b' }}>{dept}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span style={{ fontWeight: '600', color: '#1e293b', marginRight: '12px' }}>{count}</span>
                                        <div style={{
                                            width: '60px',
                                            height: '6px',
                                            backgroundColor: '#e2e8f0',
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
                <div className="modern-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="bi bi-activity me-2" style={{ color: '#10b981' }}></i>
                            Recent Activity
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="activity-list">
                            {generateRecentActivity.map((activity, index) => (
                                <div key={index} className="d-flex align-items-center mb-3 p-3" 
                                     style={{ background: '#f8fafc', borderRadius: '8px' }}>
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
                                        <p style={{ margin: 0, fontWeight: '500', color: '#1e293b' }}>{activity.text}</p>
                                        <small style={{ color: '#64748b' }}>{activity.time}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;