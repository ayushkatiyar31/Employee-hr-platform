import React, { useState } from 'react';
import { notify } from '../utils';

const LeaveForm = ({ showModal, setShowModal }) => {
    const [leaveData, setLeaveData] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
        employeeName: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const leaveTypes = [
        { id: 'sick', name: 'Sick Leave' },
        { id: 'vacation', name: 'Vacation Leave' },
        { id: 'personal', name: 'Personal Leave' },
        { id: 'maternity', name: 'Maternity Leave' },
        { id: 'paternity', name: 'Paternity Leave' },
        { id: 'emergency', name: 'Emergency Leave' }
    ];

    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const handleSubmit = () => {
        if (!leaveData.employeeName || !leaveData.leaveType || !leaveData.startDate || !leaveData.endDate || !leaveData.reason) {
            notify('Please fill all required fields', 'warning');
            return;
        }

        setIsSubmitting(true);
        
        setTimeout(() => {
            // Save leave application to localStorage
            const newLeave = {
                id: Date.now().toString(),
                employeeId: leaveData.employeeName,
                leaveType: leaveData.leaveType,
                startDate: leaveData.startDate,
                endDate: leaveData.endDate,
                reason: leaveData.reason,
                status: 'pending',
                appliedDate: new Date().toISOString().split('T')[0],
                days: calculateDays(leaveData.startDate, leaveData.endDate)
            };
            
            const existingLeaves = JSON.parse(localStorage.getItem('leaves') || '[]');
            const updatedLeaves = [newLeave, ...existingLeaves];
            localStorage.setItem('leaves', JSON.stringify(updatedLeaves));
            
            notify('Leave application submitted successfully!', 'success');
            setIsSubmitting(false);
            setLeaveData({
                leaveType: '',
                startDate: '',
                endDate: '',
                reason: '',
                employeeName: ''
            });
            setShowModal(false);
        }, 1500);
    };

    const handleClose = () => {
        setLeaveData({
            leaveType: '',
            startDate: '',
            endDate: '',
            reason: '',
            employeeName: ''
        });
        setShowModal(false);
    };

    if (!showModal) return null;

    return (
        <div className="modal fade show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg" style={{ margin: 0 }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-calendar-event me-2"></i>
                            Leave Application
                        </h5>
                        <button type="button" className="btn btn-outline-secondary" onClick={handleClose} style={{ padding: '4px 8px' }}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Employee Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={leaveData.employeeName}
                                        onChange={(e) => setLeaveData({...leaveData, employeeName: e.target.value})}
                                        placeholder="Enter employee name"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Leave Type *</label>
                                    <select 
                                        className="form-control"
                                        value={leaveData.leaveType}
                                        onChange={(e) => setLeaveData({...leaveData, leaveType: e.target.value})}
                                    >
                                        <option value="">Select leave type</option>
                                        {leaveTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Start Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={leaveData.startDate}
                                        onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">End Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={leaveData.endDate}
                                        onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group mb-3">
                                    <label className="form-label">Reason *</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={leaveData.reason}
                                        onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
                                        placeholder="Please provide reason for leave"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner-border spinner-border-sm me-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg me-2"></i>
                                    Submit Application
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveForm;
