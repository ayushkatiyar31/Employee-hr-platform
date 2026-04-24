import React from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';
import { announcementApi, attendanceApi, dashboardApi, employeeApi, leaveApi } from '../api';
import { validateDateRange } from '../validation';

const EmployeeShell = ({ title, subtitle, actions, children }) => (
    <div className="workspace-page-wrap">
        <section className="workspace-surface">
            <div className="workspace-surface-inner">
                <div className="workspace-page-head">
                    <div>
                        <div className="workspace-eyebrow">
                            <i className="bi bi-person-workspace"></i>
                            <span>Employee Portal</span>
                        </div>
                        <h2 className="workspace-title">{title}</h2>
                        <p className="workspace-subtitle">{subtitle}</p>
                    </div>
                    {actions ? <div className="workspace-hero-actions">{actions}</div> : null}
                </div>
            </div>
        </section>
        {children}
    </div>
);

const useAsyncData = (loader, deps = []) => {
    const [state, setState] = React.useState({ loading: true, error: '', data: null });

    React.useEffect(() => {
        let active = true;
        setState({ loading: true, error: '', data: null });
        loader()
            .then((data) => active && setState({ loading: false, error: '', data }))
            .catch((error) => active && setState({ loading: false, error: error.message || 'Failed to load', data: null }));

        return () => { active = false; };
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps

    return state;
};

const DataState = ({ state, children }) => {
    if (state.loading) return <div className="workspace-empty">Loading...</div>;
    if (state.error) return <div className="workspace-empty">{state.error}</div>;
    return children(state.data);
};

const EmployeeDashboardPage = () => {
    const state = useAsyncData(() => dashboardApi.employee().then((res) => res.data), []);

    return (
        <EmployeeShell title="Your HR self-service workspace." subtitle="View your profile, attendance summary, and leave balance in one place.">
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <DataState state={state}>
                        {(data) => (
                            <>
                                <div className="workspace-grid metrics">
                                    {[
                                        { label: 'Attendance Days', value: data.attendanceSummary.totalMarkedDays, note: 'Marked attendance records', color: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', icon: 'bi-calendar-check-fill' },
                                        { label: 'Pending Leave', value: data.leaveSummary.pending, note: 'Waiting for HR approval', color: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', icon: 'bi-hourglass-split' },
                                        { label: 'Approved Leave', value: data.leaveSummary.approved, note: 'Approved requests', color: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)', icon: 'bi-patch-check-fill' },
                                        { label: 'Annual Balance', value: data.leaveSummary.balance?.annual ?? 0, note: 'Remaining annual leave days', color: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)', icon: 'bi-airplane-fill' }
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
                                </div>
                                <div className="workspace-grid two-up" style={{ marginTop: '24px' }}>
                                    <div className="workspace-data-points">
                                        <div className="workspace-data-point"><span className="workspace-data-label">Name</span><span className="workspace-data-value">{data.profile.name}</span></div>
                                        <div className="workspace-data-point"><span className="workspace-data-label">Email</span><span className="workspace-data-value">{data.profile.email}</span></div>
                                        <div className="workspace-data-point"><span className="workspace-data-label">Department</span><span className="workspace-data-value">{data.profile.department}</span></div>
                                        <div className="workspace-data-point"><span className="workspace-data-label">Designation</span><span className="workspace-data-value">{data.profile.designation}</span></div>
                                    </div>
                                    <div className="workspace-data-points">
                                        {Object.entries(data.leaveSummary.balance || {}).map(([type, value]) => (
                                            <div key={type} className="workspace-data-point">
                                                <span className="workspace-data-label">{type}</span>
                                                <span className="workspace-data-value">{value} day(s)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </DataState>
                </div>
            </section>
        </EmployeeShell>
    );
};

const AttendancePage = () => {
    const [refreshKey, setRefreshKey] = React.useState(0);
    const state = useAsyncData(() => attendanceApi.mine().then((res) => res.data), [refreshKey]);

    const checkIn = async () => {
        await attendanceApi.checkIn();
        setRefreshKey((value) => value + 1);
    };

    const checkOut = async () => {
        await attendanceApi.checkOut();
        setRefreshKey((value) => value + 1);
    };

    return (
        <EmployeeShell
            title="Attendance"
            subtitle="Mark your check-in and check-out, then review your recent attendance history."
            actions={
                <>
                    <button className="workspace-button" onClick={checkIn}>Check In</button>
                    <button className="workspace-button-secondary" onClick={checkOut}>Check Out</button>
                </>
            }
        >
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <div className="workspace-list">
                        <DataState state={state}>
                            {(records) => records.length ? records.map((record) => (
                                <div key={record._id} className="workspace-list-item">
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{record.date}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{record.status}</div>
                                    </div>
                                    <div style={{ color: '#334155', fontWeight: 700 }}>
                                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '--'} / {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '--'}
                                    </div>
                                </div>
                            )) : <div className="workspace-empty">No attendance records yet.</div>}
                        </DataState>
                    </div>
                </div>
            </section>
        </EmployeeShell>
    );
};

const LeavesPage = () => {
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [formData, setFormData] = React.useState({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
    const [error, setError] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const state = useAsyncData(() => leaveApi.list().then((res) => res.data), [refreshKey]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const dateError = validateDateRange(formData.startDate, formData.endDate, { allowPastStart: false, maxRangeDays: 45 });
        if (dateError) {
            setError(dateError);
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            await leaveApi.create(formData);
            setFormData({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
            setRefreshKey((value) => value + 1);
        } catch (apiError) {
            setError(apiError.message || 'Unable to submit leave request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <EmployeeShell title="Leave" subtitle="Apply for leave and track the status of every request.">
            <section className="workspace-grid two-up">
                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <h3 className="workspace-section-title">Apply for leave</h3>
                        <form className="workspace-grid" style={{ marginTop: '18px' }} onSubmit={handleSubmit}>
                            <select className="workspace-select" value={formData.leaveType} onChange={(e) => setFormData((prev) => ({ ...prev, leaveType: e.target.value }))}>
                                <option value="annual">Annual</option>
                                <option value="sick">Sick</option>
                                <option value="maternity">Maternity</option>
                                <option value="emergency">Emergency</option>
                            </select>
                            <input className="workspace-input" type="date" value={formData.startDate} onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))} required />
                            <input className="workspace-input" type="date" value={formData.endDate} onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))} required />
                            <textarea className="workspace-textarea" style={{ minHeight: '130px' }} value={formData.reason} onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Reason" required />
                            {error && <div className="field-error">{error}</div>}
                            <button className="workspace-button" type="submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Leave'}
                            </button>
                        </form>
                    </div>
                </div>
                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <div className="workspace-list">
                            <DataState state={state}>
                                {(rows) => rows.length ? rows.map((row) => (
                                    <div key={row._id} className="workspace-list-item">
                                        <div>
                                            <div style={{ fontWeight: 800 }}>{row.leaveType} leave</div>
                                            <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{new Date(row.startDate).toLocaleDateString()} to {new Date(row.endDate).toLocaleDateString()}</div>
                                        </div>
                                        <span className={`workspace-pill ${row.status}`}>{row.status}</span>
                                    </div>
                                )) : <div className="workspace-empty">No leave requests yet.</div>}
                            </DataState>
                        </div>
                    </div>
                </div>
            </section>
        </EmployeeShell>
    );
};

const ProfilePage = () => {
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [formData, setFormData] = React.useState({ phone: '', address: '', emergencyContact: '' });
    const state = useAsyncData(() => employeeApi.myProfile().then((res) => res.data), [refreshKey]);

    React.useEffect(() => {
        if (state.data) {
            setFormData({
                phone: state.data.phone || '',
                address: state.data.address || '',
                emergencyContact: state.data.emergencyContact || ''
            });
        }
    }, [state.data]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await employeeApi.updateMyProfile(formData);
        setRefreshKey((value) => value + 1);
    };

    return (
        <EmployeeShell title="Profile" subtitle="Update your personal details and emergency information.">
            <section className="workspace-grid two-up">
                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <DataState state={state}>
                            {(profile) => (
                                <div className="workspace-data-points">
                                    <div className="workspace-data-point"><span className="workspace-data-label">Name</span><span className="workspace-data-value">{profile.name}</span></div>
                                    <div className="workspace-data-point"><span className="workspace-data-label">Email</span><span className="workspace-data-value">{profile.email}</span></div>
                                    <div className="workspace-data-point"><span className="workspace-data-label">Department</span><span className="workspace-data-value">{profile.department}</span></div>
                                    <div className="workspace-data-point"><span className="workspace-data-label">Designation</span><span className="workspace-data-value">{profile.designation}</span></div>
                                </div>
                            )}
                        </DataState>
                    </div>
                </div>
                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <form className="workspace-grid" onSubmit={handleSubmit}>
                            <input className="workspace-input" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} />
                            <input className="workspace-input" placeholder="Address" value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} />
                            <input className="workspace-input" placeholder="Emergency contact" value={formData.emergencyContact} onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContact: e.target.value }))} />
                            <button className="workspace-button" type="submit">Update Profile</button>
                        </form>
                    </div>
                </div>
            </section>
        </EmployeeShell>
    );
};

const AnnouncementsPage = () => {
    const state = useAsyncData(() => announcementApi.list().then((res) => res.data), []);

    return (
        <EmployeeShell title="Announcements" subtitle="Read updates and announcements sent by HR.">
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <div className="workspace-list">
                        <DataState state={state}>
                            {(rows) => rows.length ? rows.map((row) => (
                                <div key={row._id} className="workspace-list-item">
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{row.title}</div>
                                        <div style={{ color: '#334155', fontSize: '0.88rem', marginTop: '6px' }}>{row.message}</div>
                                    </div>
                                    <span className="workspace-pill active">{row.audience}</span>
                                </div>
                            )) : <div className="workspace-empty">No announcements yet.</div>}
                        </DataState>
                    </div>
                </div>
            </section>
        </EmployeeShell>
    );
};

const EmployeePortal = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const navItems = [
        { path: 'dashboard', label: 'Dashboard', icon: 'bi-house-door-fill' },
        { path: 'attendance', label: 'Attendance', icon: 'bi-calendar-check-fill' },
        { path: 'leave', label: 'Leave', icon: 'bi-calendar2-week-fill' },
        { path: 'profile', label: 'Profile', icon: 'bi-person-badge-fill' },
        { path: 'announcements', label: 'Announcements', icon: 'bi-megaphone-fill' }
    ];

    return (
        <div className="workspace-shell">
            <header className="workspace-topbar">
                <div className="workspace-topbar-inner">
                    <div className="workspace-brand">
                        <div className="workspace-brand-mark"><i className="bi bi-person-workspace"></i></div>
                        <div>
                            <h1 className="workspace-brand-title">EmployeeHR Employee</h1>
                            <p className="workspace-brand-subtitle">Self-service portal for attendance, leave, and personal profile details.</p>
                        </div>
                    </div>
                    <nav className="workspace-nav">
                        {navItems.map((item) => (
                            <NavLink key={item.path} to={item.path} className={({ isActive }) => `workspace-nav-item ${isActive ? 'active' : ''}`}>
                                <i className={`bi ${item.icon}`}></i>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                    <div className="workspace-user-chip">
                        <div className="workspace-user-avatar">{(user?.name || 'E').charAt(0).toUpperCase()}</div>
                        <div className="workspace-user-meta">
                            <span className="workspace-user-name">{user?.name}</span>
                            <span className="workspace-user-role">{user?.role}</span>
                        </div>
                        <button className="workspace-button-danger" onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
                    </div>
                </div>
            </header>
            <div className="workspace-main">
                <Routes>
                    <Route path="/" element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<EmployeeDashboardPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="leave" element={<LeavesPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                </Routes>
            </div>
        </div>
    );
};

export default EmployeePortal;
