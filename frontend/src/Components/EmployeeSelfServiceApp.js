import React, { useMemo, useState } from 'react';
import { notify } from '../utils';
import { getInclusiveDayCount, validateDateRange } from '../validation';
import { useAuth } from './AuthContext';

const initialLeaveForm = {
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
};

const employeeNav = [
    { id: 'overview', label: 'Overview', icon: 'bi-house-door-fill' },
    { id: 'leave', label: 'My Leave', icon: 'bi-calendar2-week-fill' },
    { id: 'profile', label: 'My Profile', icon: 'bi-person-badge-fill' }
];

const EmployeeSelfServiceApp = ({ user }) => {
    const { logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('overview');
    const [formData, setFormData] = useState(initialLeaveForm);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [errors, setErrors] = useState({});

    const myLeaves = useMemo(() => {
        const allLeaves = JSON.parse(localStorage.getItem('leaves') || '[]');
        return allLeaves.filter((leave) => {
            const employeeName = (leave.employeeId || '').trim().toLowerCase();
            return employeeName === (user?.name || '').trim().toLowerCase();
        });
    }, [user]);

    const leaveStats = useMemo(() => ({
        total: myLeaves.length,
        pending: myLeaves.filter((leave) => leave.status === 'pending').length,
        approved: myLeaves.filter((leave) => leave.status === 'approved').length,
        upcoming: myLeaves.filter((leave) => {
            const start = new Date(leave.startDate);
            return !Number.isNaN(start.getTime()) && start >= new Date();
        }).length
    }), [myLeaves]);

    const dateError = validateDateRange(formData.startDate, formData.endDate, {
        allowPastStart: false,
        maxRangeDays: 45
    });

    const days = getInclusiveDayCount(formData.startDate, formData.endDate);

    const handleApplyLeave = () => {
        const nextErrors = {};

        if (dateError) {
            nextErrors.dates = dateError;
        }

        if (formData.reason.trim().length < 10) {
            nextErrors.reason = 'Please provide at least 10 characters';
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            notify('Please fix the highlighted leave fields', 'error');
            return;
        }

        const newLeave = {
            id: Date.now().toString(),
            employeeId: user.name,
            employeeName: user.name,
            leaveType: formData.leaveType,
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason.trim(),
            status: 'pending',
            appliedDate: new Date().toISOString().split('T')[0],
            days
        };

        const existingLeaves = JSON.parse(localStorage.getItem('leaves') || '[]');
        localStorage.setItem('leaves', JSON.stringify([newLeave, ...existingLeaves]));
        window.dispatchEvent(new Event('dataUpdated'));
        setFormData(initialLeaveForm);
        setErrors({});
        setShowApplyModal(false);
        notify('Leave request submitted successfully', 'success');
    };

    const upcomingLeave = myLeaves.find((leave) => leave.status === 'approved');

    const renderOverview = () => (
        <div className="workspace-page-wrap">
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <div className="workspace-page-head" style={{ marginBottom: 0 }}>
                        <div>
                            <div className="workspace-eyebrow">
                                <i className="bi bi-person-workspace"></i>
                                <span>Employee Workspace</span>
                            </div>
                            <h2 className="workspace-title">Welcome back, {user?.name}.</h2>
                            <p className="workspace-subtitle">
                                This side is designed for employees: your leave requests, your profile, and the updates you actually need.
                            </p>
                        </div>
                        <div className="workspace-hero-actions">
                            <button className="workspace-button" onClick={() => setShowApplyModal(true)}>
                                <i className="bi bi-calendar-plus-fill" style={{ marginRight: '8px' }}></i>
                                Apply Leave
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="workspace-grid metrics">
                {[
                    { label: 'Requests Sent', value: leaveStats.total, note: 'All of your submitted leave requests', color: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)', icon: 'bi-send-fill' },
                    { label: 'Pending Review', value: leaveStats.pending, note: 'Waiting for HR approval', color: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', icon: 'bi-hourglass-split' },
                    { label: 'Approved', value: leaveStats.approved, note: 'Approved and ready to plan around', color: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', icon: 'bi-patch-check-fill' },
                    { label: 'Upcoming Leave', value: leaveStats.upcoming, note: 'Future approved leave windows', color: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)', icon: 'bi-airplane-fill' }
                ].map((card) => (
                    <div key={card.label} className="workspace-metric">
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
                        <h3 className="workspace-section-title">Next Steps</h3>
                        <p className="workspace-section-note">The employee experience should feel focused and low-friction.</p>
                        <div className="workspace-action-grid" style={{ marginTop: '18px' }}>
                            {[
                                { title: 'Apply for leave', description: 'Submit a date range and reason in a single flow.', icon: 'bi-calendar-plus-fill', color: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', action: () => setShowApplyModal(true) },
                                { title: 'Track requests', description: 'See which requests are pending, approved, or rejected.', icon: 'bi-list-check', color: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)', action: () => setCurrentPage('leave') },
                                { title: 'Check my profile', description: 'Review role, company, and account identity details.', icon: 'bi-person-badge-fill', color: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)', action: () => setCurrentPage('profile') }
                            ].map((item) => (
                                <button key={item.title} type="button" className="workspace-action-card" onClick={item.action}>
                                    <div className="workspace-action-icon" style={{ background: item.color }}>
                                        <i className={`bi ${item.icon}`}></i>
                                    </div>
                                    <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{item.title}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>{item.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <h3 className="workspace-section-title">Current Status</h3>
                        <p className="workspace-section-note">A quick read on what is already approved.</p>
                        {upcomingLeave ? (
                            <div className="workspace-list" style={{ marginTop: '18px' }}>
                                <div className="workspace-list-item">
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{upcomingLeave.leaveType} leave</div>
                                        <div style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '4px' }}>
                                            {new Date(upcomingLeave.startDate).toLocaleDateString()} to {new Date(upcomingLeave.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className="workspace-pill approved">{upcomingLeave.status}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="workspace-empty" style={{ marginTop: '18px' }}>
                                No approved leave scheduled yet.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );

    const renderLeavePage = () => (
        <div className="workspace-page-wrap">
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <div className="workspace-page-head">
                        <div>
                            <div className="workspace-eyebrow">
                                <i className="bi bi-calendar2-week-fill"></i>
                                <span>My Leave</span>
                            </div>
                            <h2 className="workspace-title">Leave requests just for you.</h2>
                            <p className="workspace-subtitle">Employees should only need their own history here, not the entire company’s queue.</p>
                        </div>
                        <div className="workspace-hero-actions">
                            <button className="workspace-button" onClick={() => setShowApplyModal(true)}>New Request</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    {myLeaves.length === 0 ? (
                        <div className="workspace-empty">You have not submitted any leave requests yet.</div>
                    ) : (
                        <div className="workspace-list">
                            {myLeaves.map((leave) => (
                                <div key={leave.id} className="workspace-list-item" style={{ alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{leave.leaveType} leave</div>
                                        <div style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '4px' }}>
                                            {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()} · {leave.days} day{leave.days > 1 ? 's' : ''}
                                        </div>
                                        <div style={{ color: '#334155', fontSize: '0.9rem', marginTop: '8px' }}>{leave.reason}</div>
                                    </div>
                                    <span className={`workspace-pill ${leave.status}`}>{leave.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );

    const renderProfilePage = () => (
        <div className="workspace-page-wrap">
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <div className="workspace-page-head">
                        <div>
                            <div className="workspace-eyebrow">
                                <i className="bi bi-person-badge-fill"></i>
                                <span>My Profile</span>
                            </div>
                            <h2 className="workspace-title">Your employee identity at a glance.</h2>
                            <p className="workspace-subtitle">A simple profile view keeps the employee side clean and focused.</p>
                        </div>
                    </div>

                    <div className="workspace-employee-grid">
                        <article className="workspace-employee-card">
                            <div className="workspace-card-top">
                                <div className="workspace-profile">
                                    <div className="workspace-avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</div>
                                    <div>
                                        <h3 className="workspace-card-title">{user?.name}</h3>
                                        <p className="workspace-card-subtitle">{user?.company || 'Company not set'}</p>
                                    </div>
                                </div>
                                <span className="workspace-pill active">{user?.role || 'employee'}</span>
                            </div>

                            <div className="workspace-data-points">
                                <div className="workspace-data-point">
                                    <span className="workspace-data-label">Email</span>
                                    <span className="workspace-data-value">{user?.email}</span>
                                </div>
                                <div className="workspace-data-point">
                                    <span className="workspace-data-label">Role</span>
                                    <span className="workspace-data-value">{user?.role}</span>
                                </div>
                                <div className="workspace-data-point">
                                    <span className="workspace-data-label">Company</span>
                                    <span className="workspace-data-value">{user?.company}</span>
                                </div>
                            </div>

                            <div className="workspace-card-actions">
                                <button className="workspace-button-ghost" onClick={() => setCurrentPage('leave')}>
                                    View Leave
                                </button>
                                <button className="workspace-button-danger" onClick={logout}>
                                    Sign Out
                                </button>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
        </div>
    );

    const renderContent = () => {
        switch (currentPage) {
            case 'leave':
                return renderLeavePage();
            case 'profile':
                return renderProfilePage();
            default:
                return renderOverview();
        }
    };

    return (
        <div className="workspace-shell">
            <header className="workspace-topbar">
                <div className="workspace-topbar-inner">
                    <div className="workspace-brand">
                        <div className="workspace-brand-mark">
                            <i className="bi bi-person-workspace"></i>
                        </div>
                        <div>
                            <h1 className="workspace-brand-title">Employee Portal</h1>
                            <p className="workspace-brand-subtitle">A self-service side focused on the employee experience.</p>
                        </div>
                    </div>

                    <nav className="workspace-nav">
                        {employeeNav.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={`workspace-nav-item ${currentPage === item.id ? 'active' : ''}`}
                                onClick={() => setCurrentPage(item.id)}
                            >
                                <i className={`bi ${item.icon}`}></i>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="workspace-toolbar">
                        <div className="workspace-user-chip">
                            <div className="workspace-user-avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</div>
                            <div className="workspace-user-meta">
                                <span className="workspace-user-name">{user?.name}</span>
                                <span className="workspace-user-role">{user?.role || 'employee'}</span>
                            </div>
                            <button className="workspace-button-danger" style={{ padding: '10px 14px' }} onClick={logout}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="workspace-main">
                {renderContent()}
            </div>

            {showApplyModal && (
                <div className="workspace-modal-backdrop">
                    <div className="workspace-modal" style={{ maxWidth: '520px' }}>
                        <div className="workspace-modal-head">
                            <h3 style={{ margin: 0 }}>Apply for Leave</h3>
                            <p style={{ margin: '6px 0 0', color: '#bfdbfe' }}>Your request will go into the HR review queue.</p>
                        </div>
                        <div className="workspace-modal-body">
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <select
                                    className="workspace-select"
                                    value={formData.leaveType}
                                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                >
                                    <option value="annual">Annual Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="maternity">Maternity Leave</option>
                                    <option value="emergency">Emergency Leave</option>
                                </select>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className="workspace-input"
                                        value={formData.startDate}
                                        onChange={(e) => {
                                            setFormData({ ...formData, startDate: e.target.value });
                                            setErrors({});
                                        }}
                                    />
                                    <input
                                        type="date"
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        className="workspace-input"
                                        value={formData.endDate}
                                        onChange={(e) => {
                                            setFormData({ ...formData, endDate: e.target.value });
                                            setErrors({});
                                        }}
                                    />
                                </div>
                                {errors.dates && <div className="field-error">{errors.dates}</div>}
                                {!errors.dates && days > 0 && (
                                    <div style={{ color: '#0f766e', fontWeight: 700, fontSize: '0.84rem' }}>
                                        Requested duration: {days} day{days > 1 ? 's' : ''}
                                    </div>
                                )}
                                <textarea
                                    className="workspace-textarea"
                                    style={{ minHeight: '110px' }}
                                    placeholder="Reason for leave"
                                    value={formData.reason}
                                    onChange={(e) => {
                                        setFormData({ ...formData, reason: e.target.value });
                                        setErrors((prev) => ({ ...prev, reason: '' }));
                                    }}
                                />
                                {errors.reason && <div className="field-error">{errors.reason}</div>}
                            </div>
                            <div className="workspace-hero-actions" style={{ justifyContent: 'flex-end', marginTop: '18px' }}>
                                <button className="workspace-button-ghost" onClick={() => { setShowApplyModal(false); setErrors({}); setFormData(initialLeaveForm); }}>
                                    Cancel
                                </button>
                                <button className="workspace-button" onClick={handleApplyLeave}>
                                    Submit Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeSelfServiceApp;
