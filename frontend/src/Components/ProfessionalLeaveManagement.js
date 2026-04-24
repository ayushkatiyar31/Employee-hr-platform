import React, { useState, useEffect, useRef } from 'react';
import { notify } from '../utils';
import '../scrollbar.css';
import '../card-effects.css';
import { addScrollHandler } from '../scrollHandler';

const ProfessionalLeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '', leaveType: 'annual', startDate: '', endDate: '', reason: '', status: 'pending'
    });
    const scrollRef = useRef(null);

    const leaveTypes = [
        { value: 'annual', label: 'Annual Leave', icon: '🏖️', color: '#10b981' },
        { value: 'sick', label: 'Sick Leave', icon: '🏥', color: '#ef4444' },
        { value: 'maternity', label: 'Maternity Leave', icon: '👶', color: '#8b5cf6' },
        { value: 'emergency', label: 'Emergency Leave', icon: '🚨', color: '#f59e0b' }
    ];

    useEffect(() => {
        const savedLeaves = localStorage.getItem('leaves');
        if (savedLeaves) {
            try {
                const parsed = JSON.parse(savedLeaves);
                if (Array.isArray(parsed)) {
                    setLeaves(parsed);
                } else {
                    setLeaves([]);
                }
            } catch (e) {
                setLeaves([]);
            }
        } else {
            setLeaves([]);
        }
        
        if (scrollRef.current) {
            addScrollHandler(scrollRef.current);
        }
    }, []);

    const filteredLeaves = leaves.filter(leave => {
        const matchesSearch = leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        notify('Submitting leave application...', 'info');
        const newLeave = {
            id: Date.now().toString(),
            ...formData,
            appliedDate: new Date().toISOString().split('T')[0],
            days: calculateDays(formData.startDate, formData.endDate)
        };
        
        const updated = [newLeave, ...leaves];
        setLeaves(updated);
        localStorage.setItem('leaves', JSON.stringify(updated));
        setShowModal(false);
        setFormData({ employeeId: '', leaveType: 'annual', startDate: '', endDate: '', reason: '', status: 'pending' });
        notify('Leave application submitted successfully', 'success');
        window.dispatchEvent(new Event('dataUpdated'));
    };

    const calculateDays = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const handleStatusChange = (leaveId, newStatus) => {
        const updated = leaves.map(leave => 
            leave.id === leaveId ? { ...leave, status: newStatus } : leave
        );
        setLeaves(updated);
        localStorage.setItem('leaves', JSON.stringify(updated));
        
        // Update employee status to on-leave when leave is approved
        if (newStatus === 'approved') {
            const approvedLeave = updated.find(leave => leave.id === leaveId);
            if (approvedLeave) {
                const localEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
                const updatedEmployees = localEmployees.map(emp => 
                    emp.name.toLowerCase().trim() === approvedLeave.employeeId.toLowerCase().trim() ? { ...emp, status: 'on-leave' } : emp
                );
                localStorage.setItem('localEmployees', JSON.stringify(updatedEmployees));
                notify('Employee status updated to on-leave', 'success');
            }
        }
        
        notify(`Leave ${newStatus} successfully`, 'success');
        window.dispatchEvent(new Event('dataUpdated'));
    };

    const getLeaveTypeInfo = (type) => leaveTypes.find(t => t.value === type) || leaveTypes[0];

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#2d3748', padding: '20px', borderRadius: '12px' }}>
            <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', marginBottom: '16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>📅 Leave Management</h2>
                        <p style={{ margin: 0, color: '#d1d5db' }}>{leaves.length} leave requests</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search leaves..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '200px', fontWeight: 'bold' }}
                        />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <button 
                            onClick={() => setShowModal(true)} 
                            style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            }}
                        >
                            + Apply Leave
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', overflow: 'hidden' }}>
                <div ref={scrollRef} className="auto-hide-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px', padding: '8px', paddingBottom: '150px' }}>
                    {filteredLeaves.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: '0.8' }}>📅</div>
                            <h3 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: '600', margin: '0 0 10px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>No Leave Requests Found</h3>
                            <p style={{ color: '#e5e7eb', fontSize: '1.1rem', margin: '0', opacity: '0.9' }}>No leave applications have been submitted yet</p>
                        </div>
                    ) : (
                        filteredLeaves.map(leave => {
                            const typeInfo = getLeaveTypeInfo(leave.leaveType);
                            return (
                                <div key={leave.id} className="hover-card" style={{ background: '#374151', borderRadius: '12px', padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: typeInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                                {typeInfo.icon}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', color: 'white' }}>{leave.employeeId}</h4>
                                                <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>{typeInfo.label}</p>
                                            </div>
                                        </div>
                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px', 
                                            fontWeight: '600', 
                                            textTransform: 'uppercase',
                                            background: leave.status === 'approved' ? '#dcfce7' : leave.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                            color: leave.status === 'approved' ? '#166534' : leave.status === 'rejected' ? '#991b1b' : '#92400e'
                                        }}>
                                            {leave.status}
                                        </span>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px', fontSize: '14px' }}>
                                        <div>
                                            <div style={{ color: '#d1d5db', fontSize: '12px' }}>Start Date</div>
                                            <div style={{ fontWeight: '600', color: 'white' }}>{new Date(leave.startDate).toLocaleDateString()}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#d1d5db', fontSize: '12px' }}>End Date</div>
                                            <div style={{ fontWeight: '600', color: 'white' }}>{new Date(leave.endDate).toLocaleDateString()}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#d1d5db', fontSize: '12px' }}>Duration</div>
                                            <div style={{ fontWeight: '600', color: 'white' }}>{leave.days} days</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ color: '#d1d5db', fontSize: '12px', marginBottom: '4px' }}>Reason</div>
                                        <p style={{ margin: 0, color: 'white', fontSize: '14px' }}>{leave.reason}</p>
                                    </div>
                                    
                                    {leave.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => handleStatusChange(leave.id, 'approved')}
                                                style={{ flex: 1, padding: '8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                                            >
                                                ✅ Approve
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(leave.id, 'rejected')}
                                                style={{ flex: 1, padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                                            >
                                                ❌ Reject
                                            </button>
                                        </div>
                                    )}
                                    {leave.status === 'rejected' && (
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => {
                                                    const updated = leaves.filter(l => l.id !== leave.id);
                                                    setLeaves(updated);
                                                    localStorage.setItem('leaves', JSON.stringify(updated));
                                                    notify('Rejected leave deleted', 'success');
                                                }}
                                                style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90vw' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Apply for Leave</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#374151' }}>Employee Name</label>
                                <input
                                    type="text"
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    placeholder="Enter employee name"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#374151' }}>Leave Type</label>
                                <select
                                    value={formData.leaveType}
                                    onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                >
                                    {leaveTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#374151' }}>Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#374151' }}>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#374151' }}>Reason</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }}
                                    placeholder="Please provide a reason for your leave request"
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    Submit Application
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
