import React, { useMemo, useState } from 'react';
import { notify } from '../utils';
import ConfirmDialog from './ConfirmDialog';

function ProfessionalEmployeeDirectory({ employees, fetchEmployees, handleUpdateEmployee }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, employee: null });

    const getEmployeeStatus = (employee) => employee.status || 'active';

    const filteredEmployees = useMemo(() => (
        employees.filter((employee) => {
            const keyword = searchTerm.toLowerCase();
            const matchesSearch =
                employee.name.toLowerCase().includes(keyword) ||
                employee.email.toLowerCase().includes(keyword) ||
                employee.department.toLowerCase().includes(keyword);
            const matchesStatus = statusFilter === 'all' || getEmployeeStatus(employee) === statusFilter;
            return matchesSearch && matchesStatus;
        })
    ), [employees, searchTerm, statusFilter]);

    const handleDeleteConfirm = async () => {
        notify('Deleting employee...', 'info');
        try {
            const localEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
            const updatedEmployees = localEmployees.filter((employee) => employee._id !== deleteConfirm.employee._id);
            localStorage.setItem('localEmployees', JSON.stringify(updatedEmployees));
            notify('Employee deleted successfully!', 'success');
            fetchEmployees();
            window.dispatchEvent(new Event('dataUpdated'));
        } catch (error) {
            notify('Failed to delete employee', 'error');
        } finally {
            setDeleteConfirm({ show: false, employee: null });
        }
    };

    return (
        <div className="workspace-page-wrap">
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <div className="workspace-page-head">
                        <div>
                            <div className="workspace-eyebrow">
                                <i className="bi bi-people-fill"></i>
                                <span>Employee Directory</span>
                            </div>
                            <h2 className="workspace-title">A more real employee view, built for everyday HR work.</h2>
                            <p className="workspace-subtitle">
                                Search instantly, scan cleaner cards, and jump into editing without fighting the interface.
                            </p>
                        </div>
                        <div className="workspace-hero-actions">
                            <button className="workspace-button" onClick={() => handleUpdateEmployee(null)}>
                                <i className="bi bi-person-plus-fill" style={{ marginRight: '8px' }}></i>
                                Add Employee
                            </button>
                        </div>
                    </div>

                    <div className="workspace-directory-toolbar">
                        <input
                            type="text"
                            className="workspace-input"
                            style={{ maxWidth: '320px' }}
                            placeholder="Search by name, email, or department"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="workspace-select"
                            style={{ maxWidth: '200px' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on-leave">On leave</option>
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontWeight: 700 }}>
                            {filteredEmployees.length} shown of {employees.length}
                        </div>
                    </div>
                </div>
            </section>

            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    {filteredEmployees.length === 0 ? (
                        <div className="workspace-empty">No employees match the current search and filters.</div>
                    ) : (
                        <div className="workspace-employee-grid">
                            {filteredEmployees.map((employee) => (
                                <article key={employee._id} className="workspace-employee-card">
                                    <div className="workspace-card-top">
                                        <div className="workspace-profile">
                                            <div className="workspace-avatar">
                                                {employee.profileImage ? (
                                                    <img src={employee.profileImage} alt={employee.name} />
                                                ) : (
                                                    employee.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <h3 className="workspace-card-title">{employee.name}</h3>
                                                <p className="workspace-card-subtitle">{employee.department}</p>
                                                <div style={{ marginTop: '10px' }}>
                                                    <span className={`workspace-pill ${getEmployeeStatus(employee)}`}>
                                                        {getEmployeeStatus(employee).replace('-', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="workspace-data-points">
                                        <div className="workspace-data-point">
                                            <span className="workspace-data-label">Email</span>
                                            <span className="workspace-data-value">{employee.email}</span>
                                        </div>
                                        <div className="workspace-data-point">
                                            <span className="workspace-data-label">Phone</span>
                                            <span className="workspace-data-value">{employee.phone || 'Not added'}</span>
                                        </div>
                                        <div className="workspace-data-point">
                                            <span className="workspace-data-label">Salary</span>
                                            <span className="workspace-data-value">${Number(employee.salary || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="workspace-data-point">
                                            <span className="workspace-data-label">Joined</span>
                                            <span className="workspace-data-value">
                                                {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'Recently'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="workspace-card-actions">
                                        <button className="workspace-button-ghost" onClick={() => handleUpdateEmployee(employee)}>
                                            Edit
                                        </button>
                                        <button className="workspace-button-danger" onClick={() => setDeleteConfirm({ show: true, employee })}>
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <ConfirmDialog
                show={deleteConfirm.show}
                title="Delete Employee"
                message={`Are you sure you want to delete ${deleteConfirm.employee?.name}?`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm({ show: false, employee: null })}
                type="danger"
            />
        </div>
    );
}

export default ProfessionalEmployeeDirectory;
