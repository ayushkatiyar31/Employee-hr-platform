import React from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';
import { announcementApi, attendanceApi, dashboardApi, employeeApi, leaveApi, payrollApi } from '../api';

const AdminShell = ({ title, subtitle, actions, children }) => (
    <div className="workspace-page-wrap">
        <section className="workspace-surface">
            <div className="workspace-surface-inner">
                <div className="workspace-page-head">
                    <div>
                        <div className="workspace-eyebrow">
                            <i className="bi bi-shield-lock-fill"></i>
                            <span>Admin / HR Workspace</span>
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
            .then((data) => {
                if (active) setState({ loading: false, error: '', data });
            })
            .catch((error) => {
                if (active) setState({ loading: false, error: error.message || 'Failed to load', data: null });
            });

        return () => {
            active = false;
        };
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps

    return state;
};

const DataState = ({ state, children }) => {
    if (state.loading) return <div className="workspace-empty">Loading...</div>;
    if (state.error) return <div className="workspace-empty">{state.error}</div>;
    return children(state.data);
};

const AdminDashboardPage = () => {
    const state = useAsyncData(() => dashboardApi.admin().then((res) => res.data), []);

    return (
        <AdminShell
            title="Operate the entire workforce from one place."
            subtitle="The HR side gives you visibility into headcount, attendance, and leave activity across the company."
        >
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <DataState state={state}>
                        {(data) => (
                            <div className="workspace-grid metrics">
                                {[
                                    { label: 'Total Employees', value: data.totalEmployees, note: 'All employee records', color: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', icon: 'bi-people-fill' },
                                    { label: 'Active Employees', value: data.activeEmployees, note: `${data.inactiveEmployees} inactive`, color: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)', icon: 'bi-person-check-fill' },
                                    { label: 'Present Today', value: data.attendanceSummary.todayPresent, note: `${data.attendanceSummary.todayAbsent} absent`, color: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', icon: 'bi-calendar-check-fill' },
                                    { label: 'Pending Leaves', value: data.leaveOverview.pending, note: `${data.leaveOverview.totalThisMonth} requests this month`, color: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)', icon: 'bi-hourglass-split' }
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
                        )}
                    </DataState>
                </div>
            </section>
        </AdminShell>
    );
};

const EmployeesPage = () => {
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [search, setSearch] = React.useState('');
    const [editingEmployee, setEditingEmployee] = React.useState(null);
    const [submitting, setSubmitting] = React.useState(false);
    const [feedback, setFeedback] = React.useState({ type: '', message: '' });
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        department: '',
        designation: '',
        salary: '',
        role: 'employee',
        status: 'active',
        profileImage: null,
        documents: []
    });
    const state = useAsyncData(
        () => employeeApi.list(search ? `search=${encodeURIComponent(search)}` : '').then((res) => res.data),
        [refreshKey, search]
    );

    const resetForm = () => {
        setEditingEmployee(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            department: '',
            designation: '',
            salary: '',
            role: 'employee',
            status: 'active',
            profileImage: null,
            documents: []
        });
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setFeedback({ type: '', message: '' });
        const payload = new FormData();

        ['name', 'email', 'password', 'phone', 'department', 'designation', 'salary', 'role', 'status'].forEach((key) => {
            if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
                payload.append(key, formData[key]);
            }
        });

        if (formData.profileImage) {
            payload.append('profileImage', formData.profileImage);
        }

        Array.from(formData.documents || []).forEach((file) => payload.append('documents', file));

        try {
            if (editingEmployee) {
                payload.append('existingDocuments', JSON.stringify(editingEmployee.documents || []));
                await employeeApi.update(editingEmployee._id, payload);
                setFeedback({ type: 'success', message: 'Employee updated successfully.' });
            } else {
                await employeeApi.create(payload);
                setFeedback({ type: 'success', message: 'Employee created successfully.' });
            }

            resetForm();
            setRefreshKey((value) => value + 1);
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Unable to save employee.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await employeeApi.remove(id);
            if (editingEmployee?._id === id) {
                resetForm();
            }
            setFeedback({ type: 'success', message: 'Employee deleted successfully.' });
            setRefreshKey((value) => value + 1);
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Unable to delete employee.' });
        }
    };

    const startEdit = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name || '',
            email: employee.email || '',
            password: '',
            phone: employee.phone || '',
            department: employee.department || '',
            designation: employee.designation || '',
            salary: employee.salary || '',
            role: employee.role || employee.user?.role || 'employee',
            status: employee.status || 'active',
            profileImage: null,
            documents: []
        });
        setFeedback({ type: '', message: '' });
    };

    return (
        <AdminShell
            title="Employee management"
            subtitle="Create, update, and remove employee records with role and designation control."
        >
            <section className="workspace-grid two-up">
                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <h3 className="workspace-section-title">{editingEmployee ? 'Edit employee' : 'Add employee'}</h3>
                        <form className="workspace-grid" onSubmit={handleCreate} style={{ marginTop: '18px' }}>
                            {['name', 'email', 'password', 'phone', 'department', 'designation', 'salary'].map((field) => (
                                <input
                                    key={field}
                                    className="workspace-input"
                                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                    value={formData[field]}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, [field]: event.target.value }))}
                                    required={editingEmployee ? ['name', 'email', 'department', 'designation'].includes(field) : ['name', 'email', 'password', 'department', 'designation'].includes(field)}
                                />
                            ))}
                            <select className="workspace-select" value={formData.role} onChange={(event) => setFormData((prev) => ({ ...prev, role: event.target.value }))}>
                                <option value="employee">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="hr">HR</option>
                                <option value="admin">Admin</option>
                            </select>
                            <select className="workspace-select" value={formData.status} onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <label className="workspace-input" style={{ display: 'grid', gap: '8px' }}>
                                <span>Profile image</span>
                                <input type="file" accept="image/*" onChange={(event) => setFormData((prev) => ({ ...prev, profileImage: event.target.files?.[0] || null }))} />
                            </label>
                            <label className="workspace-input" style={{ display: 'grid', gap: '8px' }}>
                                <span>Employee documents</span>
                                <input type="file" multiple onChange={(event) => setFormData((prev) => ({ ...prev, documents: event.target.files || [] }))} />
                            </label>
                            {editingEmployee?.documents?.length ? (
                                <div className="workspace-data-points">
                                    {editingEmployee.documents.map((document, index) => (
                                        <div key={`${document.url}-${index}`} className="workspace-data-point">
                                            <span className="workspace-data-label">Existing document</span>
                                            <a className="workspace-data-value" href={document.url} target="_blank" rel="noreferrer">{document.name}</a>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                            {feedback.message ? (
                                <div className={feedback.type === 'error' ? 'field-error' : 'workspace-empty'}>{feedback.message}</div>
                            ) : null}
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <button className="workspace-button" type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Save Employee'}
                                </button>
                                {editingEmployee ? (
                                    <button className="workspace-button-secondary" type="button" onClick={resetForm}>
                                        Cancel Edit
                                    </button>
                                ) : null}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <div className="workspace-directory-toolbar">
                            <input className="workspace-input" placeholder="Search employees" value={search} onChange={(event) => setSearch(event.target.value)} />
                        </div>
                        <div className="workspace-list" style={{ marginTop: '18px' }}>
                            <DataState state={state}>
                                {(employees) => employees.length ? employees.map((employee) => (
                                    <div key={employee._id} className="workspace-list-item">
                                        <div>
                                            <div style={{ fontWeight: 800 }}>{employee.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{employee.designation} | {employee.department}</div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>{employee.email}</div>
                                            {employee.documents?.length ? (
                                                <div style={{ color: '#0f172a', fontSize: '0.8rem', marginTop: '6px' }}>
                                                    {employee.documents.length} document(s) uploaded
                                                </div>
                                            ) : null}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className={`workspace-pill ${employee.status || 'active'}`}>{employee.status || 'active'}</span>
                                            <button className="workspace-button-secondary" onClick={() => startEdit(employee)}>Edit</button>
                                            <button className="workspace-button-danger" onClick={() => handleDelete(employee._id)}>Delete</button>
                                        </div>
                                    </div>
                                )) : <div className="workspace-empty">No employees found.</div>}
                            </DataState>
                        </div>
                    </div>
                </div>
            </section>
        </AdminShell>
    );
};

const AttendancePage = () => {
    const [month, setMonth] = React.useState('');
    const state = useAsyncData(
        () => attendanceApi.list(month ? `month=${month}` : '').then((res) => res.data),
        [month]
    );

    return (
        <AdminShell
            title="Attendance management"
            subtitle="View all employee attendance and filter by month for payroll and compliance workflows."
            actions={<input className="workspace-input" style={{ minWidth: '180px' }} type="month" value={month} onChange={(e) => setMonth(e.target.value)} />}
        >
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <div className="workspace-list">
                        <DataState state={state}>
                            {(records) => records.length ? records.map((record) => (
                                <div key={record._id} className="workspace-list-item">
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{record.employee?.name || 'Employee'}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{record.date} · {record.employee?.department || 'Department'}</div>
                                    </div>
                                    <div style={{ color: '#334155', fontWeight: 700 }}>
                                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '--'} / {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '--'}
                                    </div>
                                </div>
                            )) : <div className="workspace-empty">No attendance records found.</div>}
                        </DataState>
                    </div>
                </div>
            </section>
        </AdminShell>
    );
};

const LeavesPage = () => {
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [actionError, setActionError] = React.useState('');
    const [updatingId, setUpdatingId] = React.useState('');
    const state = useAsyncData(() => leaveApi.list().then((res) => res.data), [refreshKey]);

    const updateStatus = async (id, status) => {
        setActionError('');
        setUpdatingId(id);
        try {
            await leaveApi.updateStatus(id, { status });
            setRefreshKey((value) => value + 1);
        } catch (error) {
            setActionError(error.message || 'Unable to update leave request');
        } finally {
            setUpdatingId('');
        }
    };

    return (
        <AdminShell
            title="Leave management"
            subtitle="Approve or reject employee leave requests with one HR workflow."
        >
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    {actionError ? <div className="field-error" style={{ marginBottom: '16px' }}>{actionError}</div> : null}
                    <div className="workspace-list">
                        <DataState state={state}>
                            {(records) => records.length ? records.map((leave) => (
                                <div key={leave._id} className="workspace-list-item">
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{leave.employeeName}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{leave.leaveType} · {leave.days} day(s) · {new Date(leave.startDate).toLocaleDateString()}</div>
                                        <div style={{ color: '#334155', fontSize: '0.88rem', marginTop: '6px' }}>{leave.reason}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span className={`workspace-pill ${leave.status}`}>{leave.status}</span>
                                        {leave.status === 'pending' && user?.role === 'admin' && (
                                            <>
                                                <button className="workspace-button" onClick={() => updateStatus(leave._id, 'approved')} disabled={updatingId === leave._id}>
                                                    {updatingId === leave._id ? 'Updating...' : 'Approve'}
                                                </button>
                                                <button className="workspace-button-danger" onClick={() => updateStatus(leave._id, 'rejected')} disabled={updatingId === leave._id}>
                                                    {updatingId === leave._id ? 'Updating...' : 'Reject'}
                                                </button>
                                            </>
                                        )}
                                        {leave.status === 'pending' && user?.role !== 'admin' ? (
                                            <span style={{ color: '#64748b', fontSize: '0.84rem', fontWeight: 700 }}>
                                                Admin approval required
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            )) : <div className="workspace-empty">No leave requests yet.</div>}
                        </DataState>
                    </div>
                </div>
            </section>
        </AdminShell>
    );
};

const PayrollPage = () => {
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [formData, setFormData] = React.useState({ employee: '', month: '', basicSalary: '', allowances: '', deductions: '' });
    const employeesState = useAsyncData(() => employeeApi.list().then((res) => res.data), []);
    const payrollsState = useAsyncData(() => payrollApi.list().then((res) => res.data), [refreshKey]);

    const handleCreate = async (event) => {
        event.preventDefault();
        await payrollApi.create(formData);
        setFormData({ employee: '', month: '', basicSalary: '', allowances: '', deductions: '' });
        setRefreshKey((value) => value + 1);
    };

    return (
        <AdminShell title="Payroll management" subtitle="Manage salaries and generate payslip-ready monthly payroll entries.">
            <section className="workspace-grid two-up">
                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <h3 className="workspace-section-title">Generate payroll</h3>
                        <form className="workspace-grid" style={{ marginTop: '18px' }} onSubmit={handleCreate}>
                            <DataState state={employeesState}>
                                {(employees) => (
                                    <select className="workspace-select" value={formData.employee} onChange={(e) => setFormData((prev) => ({ ...prev, employee: e.target.value }))} required>
                                        <option value="">Select employee</option>
                                        {employees.map((employee) => (
                                            <option key={employee._id} value={employee._id}>{employee.name}</option>
                                        ))}
                                    </select>
                                )}
                            </DataState>
                            <input className="workspace-input" type="month" value={formData.month} onChange={(e) => setFormData((prev) => ({ ...prev, month: e.target.value }))} required />
                            <input className="workspace-input" placeholder="Basic salary" value={formData.basicSalary} onChange={(e) => setFormData((prev) => ({ ...prev, basicSalary: e.target.value }))} required />
                            <input className="workspace-input" placeholder="Allowances" value={formData.allowances} onChange={(e) => setFormData((prev) => ({ ...prev, allowances: e.target.value }))} />
                            <input className="workspace-input" placeholder="Deductions" value={formData.deductions} onChange={(e) => setFormData((prev) => ({ ...prev, deductions: e.target.value }))} />
                            <button className="workspace-button" type="submit">Generate Payroll</button>
                        </form>
                    </div>
                </div>
                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <div className="workspace-list">
                            <DataState state={payrollsState}>
                                {(rows) => rows.length ? rows.map((row) => (
                                    <div key={row._id} className="workspace-list-item">
                                        <div>
                                            <div style={{ fontWeight: 800 }}>{row.employee?.name || 'Employee'}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.84rem' }}>{row.month} · {row.status}</div>
                                        </div>
                                        <div style={{ fontWeight: 800 }}>${row.netSalary}</div>
                                    </div>
                                )) : <div className="workspace-empty">No payroll records yet.</div>}
                            </DataState>
                        </div>
                    </div>
                </div>
            </section>
        </AdminShell>
    );
};

const AnnouncementsPage = () => {
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [formData, setFormData] = React.useState({ title: '', message: '', audience: 'all' });
    const state = useAsyncData(() => announcementApi.list().then((res) => res.data), [refreshKey]);

    const handleCreate = async (event) => {
        event.preventDefault();
        await announcementApi.create(formData);
        setFormData({ title: '', message: '', audience: 'all' });
        setRefreshKey((value) => value + 1);
    };

    return (
        <AdminShell title="Announcements" subtitle="Send HR notifications and company-wide announcements to employees.">
            <section className="workspace-grid two-up">
                <div className="workspace-surface">
                    <div className="workspace-surface-inner">
                        <h3 className="workspace-section-title">New announcement</h3>
                        <form className="workspace-grid" style={{ marginTop: '18px' }} onSubmit={handleCreate}>
                            <input className="workspace-input" placeholder="Title" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} required />
                            <textarea className="workspace-textarea" style={{ minHeight: '140px' }} placeholder="Message" value={formData.message} onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))} required />
                            <select className="workspace-select" value={formData.audience} onChange={(e) => setFormData((prev) => ({ ...prev, audience: e.target.value }))}>
                                <option value="all">All users</option>
                                <option value="employees">Employees only</option>
                                <option value="admins">Admin team only</option>
                            </select>
                            <button className="workspace-button" type="submit">Send Announcement</button>
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
                                            <div style={{ fontWeight: 800 }}>{row.title}</div>
                                            <div style={{ color: '#334155', fontSize: '0.88rem', marginTop: '6px' }}>{row.message}</div>
                                        </div>
                                        <span className="workspace-pill active">{row.audience}</span>
                                    </div>
                                )) : <div className="workspace-empty">No announcements yet.</div>}
                            </DataState>
                        </div>
                    </div>
                </div>
            </section>
        </AdminShell>
    );
};

const AdminPortal = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const navItems = [
        { path: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
        { path: 'employees', label: 'Employees', icon: 'bi-people-fill' },
        { path: 'attendance', label: 'Attendance', icon: 'bi-calendar-check-fill' },
        { path: 'leaves', label: 'Leaves', icon: 'bi-calendar2-week-fill' },
        { path: 'payroll', label: 'Payroll', icon: 'bi-wallet2' },
        { path: 'announcements', label: 'Announcements', icon: 'bi-megaphone-fill' }
    ];

    return (
        <div className="workspace-shell">
            <header className="workspace-topbar">
                <div className="workspace-topbar-inner">
                    <div className="workspace-brand">
                        <div className="workspace-brand-mark"><i className="bi bi-buildings-fill"></i></div>
                        <div>
                            <h1 className="workspace-brand-title">EmployeeHR Admin</h1>
                            <p className="workspace-brand-subtitle">Role-based HR platform for admin and employee operations.</p>
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
                        <div className="workspace-user-avatar">{(user?.name || 'A').charAt(0).toUpperCase()}</div>
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
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="employees" element={<EmployeesPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="leaves" element={<LeavesPage />} />
                    <Route path="payroll" element={<PayrollPage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminPortal;
