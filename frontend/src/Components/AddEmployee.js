import React, { useEffect, useState, useCallback } from 'react'
import { notify } from '../utils';
import { CreateEmployee, UpdateEmployeeById } from '../api';

function AddEmployee({
    showModal, setShowModal, fetchEmployees, employeeObj
}) {
    const [employee, setEmployee] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        salary: '',
        profileImage: null,
        status: 'active'
    });
    const [updateMode, setUpdateMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (employeeObj) {
            setEmployee(employeeObj);
            setUpdateMode(true);
        }
    }, [employeeObj]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setEmployee(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setEmployee(prev => ({ ...prev, profileImage: event.target.result }));
            };
            reader.readAsDataURL(file);
        } else {
            setEmployee(prev => ({ ...prev, profileImage: null }));
        }
    }, []);

    const resetEmployeeStates = useCallback(() => {
        setEmployee({
            name: '',
            email: '',
            phone: '',
            department: '',
            salary: '',
            profileImage: null,
            status: 'active'
        })
    }, []);

    const handleAddEmployee = useCallback(async (e) => {
        e.preventDefault();
        if (submitting) return;
        
        setSubmitting(true);
        
        // Always use local storage - no API calls
        const localEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
        
        if (updateMode) {
            // Update existing employee
            notify('Updating employee...', 'info');
            const updatedEmployees = localEmployees.map(emp => 
                emp._id === employee._id ? employee : emp
            );
            localStorage.setItem('localEmployees', JSON.stringify(updatedEmployees));
            notify('Employee updated successfully!', 'success');
        } else {
            // Add new employee
            notify('Adding employee...', 'info');
            const newEmployee = {
                ...employee,
                _id: Date.now().toString(),
                position: employee.department,
                createdAt: new Date().toISOString()
            };
            localEmployees.push(newEmployee);
            localStorage.setItem('localEmployees', JSON.stringify(localEmployees));
            notify('Employee added successfully!', 'success');
        }
        
        setSubmitting(false);
        setShowModal(false);
        resetEmployeeStates();
        setUpdateMode(false);
        
        fetchEmployees();
    }, [employee, updateMode, submitting, fetchEmployees, resetEmployeeStates, setShowModal]);

    const handleModalClose = useCallback(() => {
        if (!submitting) {
            setShowModal(false);
            setUpdateMode(false);
            resetEmployeeStates();
        }
    }, [submitting, setShowModal, resetEmployeeStates]);

    return (
        <div className={`modal ${showModal ? 'show' : 'hide'}`} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title" style={{ color: '#667eea', fontWeight: '600' }}>
                            {updateMode ? 'Update Employee' : 'Add New Employee'}
                        </h4>
                        <button type="button" className="btn-close" onClick={handleModalClose} disabled={submitting}>×</button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleAddEmployee}>
                            <div className="form-row">
                                <div className="form-col">
                                    <label className="form-label"><span style={{fontSize: '18px', filter: 'hue-rotate(240deg) saturate(2)'}}>👤</span> Full Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="name" 
                                        value={employee.name} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Enter full name"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="form-col">
                                    <label className="form-label"><span style={{fontSize: '18px', filter: 'hue-rotate(0deg) saturate(3) brightness(1.2)'}}>✉️</span> Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        name="email" 
                                        value={employee.email} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Enter email address"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="form-col">
                                    <label className="form-label"><span style={{fontSize: '18px', filter: 'hue-rotate(120deg) saturate(2) brightness(1.1)'}}>📞</span> Phone Number</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="phone" 
                                        value={employee.phone} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Enter phone number"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="form-col">
                                    <label className="form-label"><span style={{fontSize: '18px', filter: 'hue-rotate(45deg) saturate(2) brightness(1.3)'}}>🏢</span> Department</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="department" 
                                        value={employee.department} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Enter department"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="form-col">
                                    <label className="form-label"><span style={{fontSize: '18px', filter: 'hue-rotate(280deg) saturate(2) brightness(1.2)'}}>💰</span> Salary</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="salary" 
                                        value={employee.salary} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Enter salary"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="form-col">
                                    <label className="form-label"><span style={{fontSize: '18px', filter: 'hue-rotate(320deg) saturate(2) brightness(1.1)'}}>🖼️</span> Profile Image</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        name="profileImage" 
                                        onChange={handleFileChange} 
                                        accept="image/*"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="form-col">
                                    <label className="form-label"><span style={{fontSize: '18px', filter: 'hue-rotate(180deg) saturate(2) brightness(1.2)'}}>📊</span> Status</label>
                                    <select 
                                        className="form-control" 
                                        name="status" 
                                        value={employee.status} 
                                        onChange={handleChange}
                                        disabled={submitting}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on-leave">On Leave</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={handleModalClose}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border-sm"></span>
                                            {updateMode ? ' Updating...' : ' Adding...'}
                                        </>
                                    ) : (
                                        updateMode ? 'Update Employee' : 'Add Employee'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddEmployee
