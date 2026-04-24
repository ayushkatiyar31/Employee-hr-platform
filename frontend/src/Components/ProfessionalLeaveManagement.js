import React, { useEffect, useMemo, useRef, useState } from 'react';
import { notify } from '../utils';
import { addScrollHandler } from '../scrollHandler';
import { getInclusiveDayCount, validateDateRange } from '../validation';
import '../scrollbar.css';
import '../card-effects.css';

const initialFormState = {
    employeeId: '',
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'pending'
};

const fieldStyle = (hasError) => ({
    width: '100%',
    padding: '12px 14px',
    border: `1px solid ${hasError ? '#dc2626' : '#cbd5e1'}`,
    borderRadius: '10px',
    background: '#f8fafc',
    color: '#0f172a'
});

const helperStyle = { margin: '6px 0 0', fontSize: '12px', color: '#b91c1c', fontWeight: '600' };

const ProfessionalLeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const scrollRef = useRef(null);

    const leaveTypes = [
        { value: 'annual', label: 'Annual Leave', accent: '#0f766e' },
        { value: 'sick', label: 'Sick Leave', accent: '#dc2626' },
        { value: 'maternity', label: 'Maternity Leave', accent: '#7c3aed' },
        { value: 'emergency', label: 'Emergency Leave', accent: '#d97706' }
    ];

    useEffect(() => {
        const savedLeaves = localStorage.getItem('leaves');
        if (savedLeaves) {
            try {
                const parsed = JSON.parse(savedLeaves);
                setLeaves(Array.isArray(parsed) ? parsed : []);
            } catch (error) {
                setLeaves([]);
            }
        }

        if (scrollRef.current) {
            addScrollHandler(scrollRef.current);
        }
    }, []);

    const filteredLeaves = useMemo(() => (
        leaves.filter((leave) => {
            const employeeText = leave.employeeId || '';
            const reasonText = leave.reason || '';
            const matchesSearch =
                employeeText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reasonText.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
    ), [leaves, searchTerm, statusFilter]);

    const dateError = validateDateRange(formData.startDate, formData.endDate, {
        allowPastStart: false,
        maxRangeDays: 60
    });

    const calculatedDays = getInclusiveDayCount(formData.startDate, formData.endDate);

    const resetForm = () => {
        setFormData(initialFormState);
        setErrors({});
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '', dates: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nextErrors = {};

        if (!formData.employeeId.trim()) {
            nextErrors.employeeId = 'Employee name is required';
        }

        if (formData.reason.trim().length < 10) {
            nextErrors.reason = 'Reason should be at least 10 characters';
        }

        if (dateError) {
            nextErrors.dates = dateError;
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            notify('Please fix the highlighted leave fields', 'error');
            return;
        }

        const newLeave = {
            id: Date.now().toString(),
            ...formData,
            employeeId: formData.employeeId.trim(),
            reason: formData.reason.trim(),
            appliedDate: new Date().toISOString().split('T')[0],
            days: calculatedDays
        };

        const updated = [newLeave, ...leaves];
        setLeaves(updated);
        localStorage.setItem('leaves', JSON.stringify(updated));
        setShowModal(false);
        resetForm();
        notify('Leave application submitted successfully', 'success');
        window.dispatchEvent(new Event('dataUpdated'));
    };

    const handleStatusChange = (leaveId, newStatus) => {
        const updated = leaves.map((leave) =>
            leave.id === leaveId ? { ...leave, status: newStatus } : leave
        );

        setLeaves(updated);
        localStorage.setItem('leaves', JSON.stringify(updated));

        if (newStatus === 'approved') {
            const approvedLeave = updated.find((leave) => leave.id === leaveId);
            if (approvedLeave) {
                const localEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
                const updatedEmployees = localEmployees.map((emp) =>
                    emp.name.toLowerCase().trim() === approvedLeave.employeeId.toLowerCase().trim()
                        ? { ...emp, status: 'on-leave' }
                        : emp
                );
                localStorage.setItem('localEmployees', JSON.stringify(updatedEmployees));
                notify('Employee status updated to on-leave', 'success');
            }
        }

        notify(`Leave ${newStatus} successfully`, 'success');
        window.dispatchEvent(new Event('dataUpdated'));
    };

    const removeLeave = (leaveId) => {
        const updated = leaves.filter((leave) => leave.id !== leaveId);
        setLeaves(updated);
        localStorage.setItem('leaves', JSON.stringify(updated));
        notify('Leave deleted successfully', 'success');
    };

    const getLeaveTypeInfo = (type) => leaveTypes.find((item) => item.value === type) || leaveTypes[0];

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
                borderRadius: '18px',
                padding: '24px',
                color: 'white',
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.6rem' }}>Leave Management</h2>
                        <p style={{ margin: 0, color: '#bfdbfe' }}>Track requests, validate dates, and keep employee status aligned.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            padding: '12px 18px',
                            borderRadius: '999px',
                            border: 'none',
                            background: '#f59e0b',
                            color: '#111827',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        New Leave Request
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
                        <div style={{ color: '#93c5fd', fontSize: '13px' }}>Total Requests</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '6px' }}>{leaves.length}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
                        <div style={{ color: '#93c5fd', fontSize: '13px' }}>Pending Approval</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '6px' }}>{leaves.filter((item) => item.status === 'pending').length}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
                        <div style={{ color: '#93c5fd', fontSize: '13px' }}>Approved</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '6px' }}>{leaves.filter((item) => item.status === 'approved').length}</div>
                    </div>
                </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '18px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search by employee or reason"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ ...fieldStyle(false), maxWidth: '280px' }}
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ ...fieldStyle(false), maxWidth: '220px' }}
                    >
                        <option value="all">All status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div style={{ flex: 1, background: '#f8fafc', borderRadius: '18px', padding: '18px', overflow: 'hidden' }}>
                <div ref={scrollRef} className="auto-hide-scrollbar" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {filteredLeaves.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', padding: '50px 20px', textAlign: 'center', color: '#475569' }}>
                                <h3 style={{ marginBottom: '8px', color: '#0f172a' }}>No leave requests found</h3>
                                <p style={{ margin: 0 }}>Try a different search or create a new request.</p>
                            </div>
                        ) : (
                            filteredLeaves.map((leave) => {
                                const typeInfo = getLeaveTypeInfo(leave.leaveType);
                                return (
                                    <div key={leave.id} className="hover-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#0f172a' }}>{leave.employeeId}</div>
                                                <div style={{ color: typeInfo.accent, fontSize: '13px', fontWeight: '700', marginTop: '4px' }}>{typeInfo.label}</div>
                                            </div>
                                            <span style={{
                                                alignSelf: 'flex-start',
                                                padding: '6px 10px',
                                                borderRadius: '999px',
                                                background: leave.status === 'approved' ? '#dcfce7' : leave.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                                color: leave.status === 'approved' ? '#166534' : leave.status === 'rejected' ? '#991b1b' : '#92400e',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                textTransform: 'uppercase'
                                            }}>
                                                {leave.status}
                                            </span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '12px' }}>Start</div>
                                                <div style={{ color: '#0f172a', fontWeight: '600' }}>{new Date(leave.startDate).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '12px' }}>End</div>
                                                <div style={{ color: '#0f172a', fontWeight: '600' }}>{new Date(leave.endDate).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: '#64748b', fontSize: '12px' }}>Days</div>
                                                <div style={{ color: '#0f172a', fontWeight: '600' }}>{leave.days}</div>
                                            </div>
                                        </div>

                                        <p style={{ margin: '0 0 16px 0', color: '#334155', lineHeight: 1.5 }}>{leave.reason}</p>

                                        {leave.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => handleStatusChange(leave.id, 'approved')} style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: '700' }}>
                                                    Approve
                                                </button>
                                                <button onClick={() => handleStatusChange(leave.id, 'rejected')} style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '700' }}>
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {leave.status !== 'pending' && (
                                            <button onClick={() => removeLeave(leave.id)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fff5f5', color: '#b91c1c', cursor: 'pointer', fontWeight: '700' }}>
                                                Delete Request
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ width: '100%', maxWidth: '560px', borderRadius: '24px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 30px 80px rgba(15, 23, 42, 0.25)' }}>
                        <div style={{ padding: '22px 24px', background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)', color: 'white' }}>
                            <h3 style={{ margin: '0 0 6px 0' }}>Apply for leave</h3>
                            <p style={{ margin: 0, color: '#bfdbfe' }}>Dates are validated before submission so the request stays clean.</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#0f172a' }}>Employee Name</label>
                                <input
                                    type="text"
                                    value={formData.employeeId}
                                    onChange={(e) => handleChange('employeeId', e.target.value)}
                                    style={fieldStyle(Boolean(errors.employeeId))}
                                    placeholder="Enter employee name"
                                    required
                                />
                                {errors.employeeId && <p style={helperStyle}>{errors.employeeId}</p>}
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#0f172a' }}>Leave Type</label>
                                <select value={formData.leaveType} onChange={(e) => handleChange('leaveType', e.target.value)} style={fieldStyle(false)}>
                                    {leaveTypes.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#0f172a' }}>Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => handleChange('startDate', e.target.value)}
                                        style={fieldStyle(Boolean(errors.dates))}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#0f172a' }}>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => handleChange('endDate', e.target.value)}
                                        style={fieldStyle(Boolean(errors.dates))}
                                        required
                                    />
                                </div>
                            </div>
                            {errors.dates && <p style={{ ...helperStyle, marginBottom: '12px' }}>{errors.dates}</p>}
                            {!errors.dates && calculatedDays > 0 && (
                                <p style={{ margin: '8px 0 16px 0', color: '#0f766e', fontWeight: '700', fontSize: '13px' }}>
                                    Duration: {calculatedDays} day{calculatedDays > 1 ? 's' : ''}
                                </p>
                            )}

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#0f172a' }}>Reason</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => handleChange('reason', e.target.value)}
                                    style={{ ...fieldStyle(Boolean(errors.reason)), minHeight: '100px', resize: 'vertical' }}
                                    placeholder="Provide a clear reason for the leave request"
                                    required
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                                    <span style={{ color: errors.reason ? '#b91c1c' : '#64748b' }}>
                                        {errors.reason || 'At least 10 characters'}
                                    </span>
                                    <span style={{ color: '#64748b' }}>{formData.reason.trim().length}/300</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '11px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', cursor: 'pointer', fontWeight: '700' }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ padding: '11px 16px', borderRadius: '10px', border: 'none', background: '#0f766e', color: 'white', cursor: 'pointer', fontWeight: '700' }}>
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalLeaveManagement;
