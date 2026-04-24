import React, { useEffect, useMemo, useState } from 'react';
import { notify } from '../utils';

const initialDepartmentState = { name: '', manager: '', budget: '', description: '' };

const ProfessionalDepartmentDirectory = () => {
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDepartment, setNewDepartment] = useState(initialDepartmentState);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, department: null });

    useEffect(() => {
        const savedDepartments = localStorage.getItem('departments');
        if (savedDepartments) {
            try {
                const parsed = JSON.parse(savedDepartments);
                setDepartments(Array.isArray(parsed) ? parsed : []);
            } catch (error) {
                setDepartments([]);
            }
        }
    }, []);

    const employeeCounts = useMemo(() => {
        const employees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
        const counts = {};

        employees.forEach((employee) => {
            const key = (employee.department || '').trim().toLowerCase();
            if (!key) return;
            counts[key] = (counts[key] || 0) + 1;
        });

        return counts;
    }, [departments]);

    const filteredDepartments = useMemo(() => (
        departments.filter((department) =>
            department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            department.manager.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ), [departments, searchTerm]);

    const handleAddDepartment = () => {
        if (!newDepartment.name.trim() || !newDepartment.manager.trim()) {
            notify('Department name and manager are required', 'error');
            return;
        }

        const nextDepartment = {
            _id: Date.now().toString(),
            ...newDepartment,
            createdAt: new Date().toISOString()
        };

        const updated = [nextDepartment, ...departments];
        setDepartments(updated);
        localStorage.setItem('departments', JSON.stringify(updated));
        setNewDepartment(initialDepartmentState);
        setShowAddModal(false);
        notify('Department added successfully!', 'success');
        window.dispatchEvent(new Event('dataUpdated'));
    };

    const handleDeleteDepartment = () => {
        const updated = departments.filter((department) => department._id !== deleteConfirm.department._id);
        setDepartments(updated);
        localStorage.setItem('departments', JSON.stringify(updated));
        setDeleteConfirm({ show: false, department: null });
        notify('Department deleted successfully!', 'success');
        window.dispatchEvent(new Event('dataUpdated'));
    };

    return (
        <div className="workspace-page-wrap">
            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    <div className="workspace-page-head">
                        <div>
                            <div className="workspace-eyebrow">
                                <i className="bi bi-diagram-3-fill"></i>
                                <span>Department Directory</span>
                            </div>
                            <h2 className="workspace-title">Make team structure easier to scan and easier to manage.</h2>
                            <p className="workspace-subtitle">
                                Every department now reads like a real operating unit, not just a raw form entry.
                            </p>
                        </div>
                        <div className="workspace-hero-actions">
                            <button className="workspace-button" onClick={() => setShowAddModal(true)}>
                                <i className="bi bi-plus-circle-fill" style={{ marginRight: '8px' }}></i>
                                Add Department
                            </button>
                        </div>
                    </div>

                    <div className="workspace-directory-toolbar">
                        <input
                            type="text"
                            className="workspace-input"
                            style={{ maxWidth: '320px' }}
                            placeholder="Search by department or manager"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontWeight: 700 }}>
                            {filteredDepartments.length} shown of {departments.length}
                        </div>
                    </div>
                </div>
            </section>

            <section className="workspace-surface">
                <div className="workspace-surface-inner">
                    {filteredDepartments.length === 0 ? (
                        <div className="workspace-empty">No departments found yet. Add one to start organizing your teams.</div>
                    ) : (
                        <div className="workspace-department-grid">
                            {filteredDepartments.map((department) => {
                                const employeeCount = employeeCounts[(department.name || '').trim().toLowerCase()] || 0;

                                return (
                                    <article key={department._id} className="workspace-department-card">
                                        <div className="workspace-card-top">
                                            <div className="workspace-profile">
                                                <div className="workspace-avatar">
                                                    <i className="bi bi-buildings-fill"></i>
                                                </div>
                                                <div>
                                                    <h3 className="workspace-card-title">{department.name}</h3>
                                                    <p className="workspace-card-subtitle">Managed by {department.manager}</p>
                                                </div>
                                            </div>
                                            <span className="workspace-pill active">Active</span>
                                        </div>

                                        <div className="workspace-data-points">
                                            <div className="workspace-data-point">
                                                <span className="workspace-data-label">Employees</span>
                                                <span className="workspace-data-value">{employeeCount}</span>
                                            </div>
                                            <div className="workspace-data-point">
                                                <span className="workspace-data-label">Budget</span>
                                                <span className="workspace-data-value">{department.budget || 'Not set'}</span>
                                            </div>
                                            <div className="workspace-data-point">
                                                <span className="workspace-data-label">Description</span>
                                                <span className="workspace-data-value">{department.description || 'No description yet'}</span>
                                            </div>
                                        </div>

                                        <div className="workspace-card-actions">
                                            <button
                                                className="workspace-button-ghost"
                                                onClick={() => notify(`${department.name} overview opened`, 'info')}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="workspace-button-danger"
                                                onClick={() => setDeleteConfirm({ show: true, department })}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {showAddModal && (
                <div className="workspace-modal-backdrop">
                    <div className="workspace-modal">
                        <div className="workspace-modal-head">
                            <h3 style={{ margin: 0 }}>Create Department</h3>
                            <p style={{ margin: '6px 0 0', color: '#bfdbfe' }}>Add the owner, budget, and the purpose of the team.</p>
                        </div>
                        <div className="workspace-modal-body">
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <input
                                    type="text"
                                    className="workspace-input"
                                    placeholder="Department name"
                                    value={newDepartment.name}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="workspace-input"
                                    placeholder="Manager name"
                                    value={newDepartment.manager}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, manager: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="workspace-input"
                                    placeholder="Budget"
                                    value={newDepartment.budget}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, budget: e.target.value })}
                                />
                                <textarea
                                    className="workspace-textarea"
                                    placeholder="Short description"
                                    style={{ minHeight: '110px' }}
                                    value={newDepartment.description}
                                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                                />
                            </div>
                            <div className="workspace-hero-actions" style={{ justifyContent: 'flex-end', marginTop: '18px' }}>
                                <button className="workspace-button-ghost" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button className="workspace-button" onClick={handleAddDepartment}>
                                    Save Department
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm.show && (
                <div className="workspace-modal-backdrop">
                    <div className="workspace-modal" style={{ maxWidth: '420px' }}>
                        <div className="workspace-modal-head" style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)' }}>
                            <h3 style={{ margin: 0 }}>Delete Department</h3>
                            <p style={{ margin: '6px 0 0', color: '#fecaca' }}>This will remove the department record from your local workspace.</p>
                        </div>
                        <div className="workspace-modal-body">
                            <p style={{ color: '#334155', marginTop: 0 }}>
                                Are you sure you want to delete <strong>{deleteConfirm.department?.name}</strong>?
                            </p>
                            <div className="workspace-hero-actions" style={{ justifyContent: 'flex-end' }}>
                                <button className="workspace-button-ghost" onClick={() => setDeleteConfirm({ show: false, department: null })}>
                                    Cancel
                                </button>
                                <button className="workspace-button-danger" onClick={handleDeleteDepartment}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalDepartmentDirectory;
