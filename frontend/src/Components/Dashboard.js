import React, { useEffect, useMemo, useState } from 'react';

const Dashboard = ({ employeesData, onNavigate, onAddEmployee, onGenerateReport, onLeaveForm }) => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        departmentCount: 0,
        avgSalary: 0,
        recentHires: 0,
        onLeave: 0
    });

    useEffect(() => {
        const calculate = () => {
            const employees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
            const uniqueDepartments = new Set();
            let salaryTotal = 0;
            let recentHires = 0;
            let onLeave = 0;
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            employees.forEach((employee) => {
                if (employee.department) {
                    uniqueDepartments.add(employee.department.trim().toLowerCase());
                }

                salaryTotal += Number(employee.salary || 0);
                if (employee.status === 'on-leave') {
                    onLeave += 1;
                }

                const createdAt = new Date(employee.createdAt || Date.now());
                if (!Number.isNaN(createdAt.getTime()) && createdAt >= thirtyDaysAgo) {
                    recentHires += 1;
                }
            });

            setStats({
                totalEmployees: employees.length,
                departmentCount: uniqueDepartments.size,
                avgSalary: employees.length ? Math.round(salaryTotal / employees.length) : 0,
                recentHires,
                onLeave
            });
        };

        calculate();
        window.addEventListener('dataUpdated', calculate);
        window.addEventListener('storage', calculate);

        return () => {
            window.removeEventListener('dataUpdated', calculate);
            window.removeEventListener('storage', calculate);
        };
    }, [employeesData]);

    const departmentBreakdown = useMemo(() => {
        const employees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
        const departmentMap = new Map();

        employees.forEach((employee) => {
            const department = (employee.department || 'Unassigned').trim();
            departmentMap.set(department, (departmentMap.get(department) || 0) + 1);
        });

        return Array.from(departmentMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, count], index) => ({
                name,
                count,
                width: employees.length ? Math.round((count / employees.length) * 100) : 0,
                color: ['#0f766e', '#1d4ed8', '#7c3aed', '#f59e0b', '#db2777', '#ef4444'][index % 6]
            }));
    }, [employeesData]);

    const recentActivity = useMemo(() => {
        const employees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
        const leaves = JSON.parse(localStorage.getItem('leaves') || '[]');
        const departments = JSON.parse(localStorage.getItem('departments') || '[]');

        const items = [];

        const getTimeAgo = (timestamp) => {
            if (!timestamp) return null;
            const created = new Date(timestamp);
            if (Number.isNaN(created.getTime())) return null;
            const diffMinutes = Math.floor((Date.now() - created.getTime()) / (1000 * 60));
            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes} min ago`;
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24) return `${diffHours} hr ago`;
            const diffDays = Math.floor(diffHours / 24);
            return diffDays > 7 ? null : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        };

        employees.forEach((employee) => {
            const time = getTimeAgo(employee.createdAt);
            if (time) {
                items.push({
                    id: `employee-${employee._id}`,
                    title: `${employee.name} joined the workspace`,
                    detail: `${employee.department} department`,
                    time,
                    icon: 'bi-person-plus-fill',
                    color: '#0f766e',
                    timestamp: new Date(employee.createdAt)
                });
            }
        });

        leaves.forEach((leave) => {
            const time = getTimeAgo(leave.appliedDate);
            if (time) {
                items.push({
                    id: `leave-${leave.id}`,
                    title: `${leave.employeeId} requested leave`,
                    detail: `${leave.leaveType} · ${leave.status}`,
                    time,
                    icon: 'bi-calendar2-check-fill',
                    color: '#1d4ed8',
                    timestamp: new Date(leave.appliedDate)
                });
            }
        });

        departments.forEach((department) => {
            const time = getTimeAgo(department.createdAt);
            if (time) {
                items.push({
                    id: `department-${department._id}`,
                    title: `${department.name} department created`,
                    detail: `Manager: ${department.manager || 'Not assigned'}`,
                    time,
                    icon: 'bi-diagram-3-fill',
                    color: '#7c3aed',
                    timestamp: new Date(department.createdAt)
                });
            }
        });

        return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
    }, [employeesData]);

    const metricCards = [
        {
            label: 'Total Employees',
            value: stats.totalEmployees,
            note: `${stats.recentHires} new this month`,
            icon: 'bi-people-fill',
            color: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)'
        },
        {
            label: 'Departments',
            value: stats.departmentCount,
            note: 'Cross-functional teams tracked',
            icon: 'bi-buildings-fill',
            color: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)'
        },
        {
            label: 'Average Salary',
            value: stats.avgSalary ? `$${stats.avgSalary.toLocaleString()}` : '$0',
            note: 'Based on local employee records',
            icon: 'bi-currency-dollar',
            color: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
        },
        {
            label: 'Currently On Leave',
            value: stats.onLeave,
            note: 'Useful for staffing visibility',
            icon: 'bi-calendar2-week-fill',
            color: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)'
        }
    ];

    const actionCards = [
        {
            title: 'Add Employee',
            description: 'Create a new profile and place them in the right team.',
            icon: 'bi-person-plus-fill',
            color: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
            onClick: () => onAddEmployee && onAddEmployee()
        },
        {
            title: 'Open Directory',
            description: 'Search, filter, and update your workforce in one place.',
            icon: 'bi-grid-3x3-gap-fill',
            color: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)',
            onClick: () => onNavigate && onNavigate('employees')
        },
        {
            title: 'Review Leave',
            description: 'Approve requests quickly and keep headcount planning accurate.',
            icon: 'bi-calendar2-check-fill',
            color: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            onClick: () => onLeaveForm ? onLeaveForm() : onNavigate && onNavigate('leaves')
        },
        {
            title: 'Generate Report',
            description: 'Turn live people data into a presentable summary.',
            icon: 'bi-file-earmark-bar-graph-fill',
            color: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
            onClick: () => onGenerateReport ? onGenerateReport() : onNavigate && onNavigate('reports')
        }
    ];

    return (
        <div className="workspace-page-wrap">
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <div className="workspace-page-head" style={{ marginBottom: 0 }}>
                        <div>
                            <div className="workspace-eyebrow">
                                <i className="bi bi-stars"></i>
                                <span>Operations Overview</span>
                            </div>
                            <h2 className="workspace-title">Run people operations from one cleaner, calmer workspace.</h2>
                            <p className="workspace-subtitle">
                                Keep your HR data visible, act on leave requests faster, and move between employees,
                                departments, and reporting without the clutter.
                            </p>
                        </div>
                        <div className="workspace-hero-actions">
                            <button className="workspace-button" onClick={() => onAddEmployee && onAddEmployee()}>
                                <i className="bi bi-plus-circle-fill" style={{ marginRight: '8px' }}></i>
                                Add Employee
                            </button>
                            <button className="workspace-button-secondary" onClick={() => onNavigate && onNavigate('reports')}>
                                <i className="bi bi-bar-chart-fill" style={{ marginRight: '8px' }}></i>
                                View Reports
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="workspace-grid metrics">
                {metricCards.map((card) => (
                    <div className="workspace-metric" key={card.label}>
                        <div className="workspace-metric-top">
                            <span className="workspace-metric-label">{card.label}</span>
                            <div className="workspace-metric-icon" style={{ background: card.color }}>
                                <i className={`bi ${card.icon}`}></i>
                            </div>
                        </div>
                        <div>
                            <div className="workspace-metric-value">{card.value}</div>
                            <div className="workspace-metric-note">{card.note}</div>
                        </div>
                    </div>
                ))}
            </section>

            <section className="workspace-grid two-up">
                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <h3 className="workspace-section-title">Quick Actions</h3>
                        <p className="workspace-section-note">The things an HR lead needs most should never be buried.</p>
                        <div className="workspace-action-grid" style={{ marginTop: '18px' }}>
                            {actionCards.map((action) => (
                                <button
                                    key={action.title}
                                    type="button"
                                    className="workspace-action-card"
                                    onClick={action.onClick}
                                >
                                    <div className="workspace-action-icon" style={{ background: action.color }}>
                                        <i className={`bi ${action.icon}`}></i>
                                    </div>
                                    <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{action.title}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>{action.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <h3 className="workspace-section-title">Department Balance</h3>
                        <p className="workspace-section-note">See where most of your headcount currently sits.</p>
                        <div className="workspace-list" style={{ marginTop: '18px' }}>
                            {departmentBreakdown.length === 0 ? (
                                <div className="workspace-empty">No department data yet.</div>
                            ) : (
                                departmentBreakdown.map((department) => (
                                    <div key={department.name} className="workspace-list-item">
                                        <div className="workspace-list-start">
                                            <div
                                                style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    borderRadius: '999px',
                                                    background: department.color
                                                }}
                                            ></div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{department.name}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{department.count} employee{department.count !== 1 ? 's' : ''}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="workspace-progress">
                                                <span style={{ width: `${department.width}%`, background: department.color }}></span>
                                            </div>
                                            <strong style={{ minWidth: '36px', textAlign: 'right' }}>{department.width}%</strong>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <div className="workspace-page-head" style={{ marginBottom: '18px' }}>
                        <div>
                            <h3 className="workspace-section-title">Recent Activity</h3>
                            <p className="workspace-section-note">A quick pulse on changes happening across the workspace.</p>
                        </div>
                        <div className="workspace-surface-actions">
                            <button className="workspace-button-ghost" onClick={() => onNavigate && onNavigate('leaves')}>
                                Leave Queue
                            </button>
                            <button className="workspace-button-ghost" onClick={() => onNavigate && onNavigate('employees')}>
                                Employee Directory
                            </button>
                        </div>
                    </div>

                    <div className="workspace-list">
                        {recentActivity.length === 0 ? (
                            <div className="workspace-empty">Activity will appear here once your workspace starts moving.</div>
                        ) : (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="workspace-list-item">
                                    <div className="workspace-list-start">
                                        <div
                                            className="workspace-dropdown-icon"
                                            style={{ background: activity.color }}
                                        >
                                            <i className={`bi ${activity.icon}`}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{activity.title}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '3px' }}>{activity.detail}</div>
                                        </div>
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700 }}>{activity.time}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
