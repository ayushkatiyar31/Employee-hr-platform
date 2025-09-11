import React, { useState, useEffect } from 'react';
import { GetAllDepartments, CreateDepartment, DeleteDepartment, GetDepartmentStats } from '../api';
import { notify } from '../utils';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [stats, setStats] = useState({ totalDepartments: 0, totalEmployees: 0, totalBudget: 0 });
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newDepartment, setNewDepartment] = useState({ name: '', manager: '', budget: '' });
    const [editDepartment, setEditDepartment] = useState({ _id: '', name: '', manager: '', budget: '' });

    useEffect(() => {
        // Load from localStorage first
        const savedDepartments = localStorage.getItem('departments');
        if (savedDepartments) {
            const parsed = JSON.parse(savedDepartments);
            setDepartments(parsed);
            calculateStats(parsed);
            setLoading(false);
        } else {
            fetchDepartments();
            fetchStats();
        }
    }, []);

    const saveDepartments = (depts) => {
        localStorage.setItem('departments', JSON.stringify(depts));
    };

    const calculateStats = (depts) => {
        const totalBudget = depts.reduce((sum, dept) => {
            const budget = dept.budget?.replace(/[$,]/g, '') || '0';
            return sum + parseFloat(budget);
        }, 0);
        
        setStats({
            totalDepartments: depts.length,
            totalEmployees: depts.reduce((sum, dept) => sum + (dept.employees || 0), 0),
            totalBudget: `$${(totalBudget / 1000000).toFixed(2)}M`
        });
    };

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await GetAllDepartments();
            setDepartments(data);
            saveDepartments(data);
        } catch (error) {
            // Start with empty data when API not available
            setDepartments([]);
            saveDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await GetDepartmentStats();
            setStats(data);
        } catch (error) {
            // Start with zero stats
            setStats({ totalDepartments: 0, totalEmployees: 0, totalBudget: '$0' });
        }
    };

    const handleAddDepartment = async () => {
        if (newDepartment.name && newDepartment.manager && newDepartment.budget) {
            try {
                await CreateDepartment(newDepartment);
                notify('Department added successfully!', 'success');
            } catch (error) {
                // Fallback: add to local state
                const newDept = {
                    _id: Date.now().toString(),
                    name: newDepartment.name,
                    employees: 0,
                    manager: newDepartment.manager,
                    budget: newDepartment.budget
                };
                setDepartments(prev => {
                    const updated = [...prev, newDept];
                    saveDepartments(updated);
                    calculateStats(updated);
                    return updated;
                });
                notify('Department added locally (API not available)', 'success');
            }
            setNewDepartment({ name: '', manager: '', budget: '' });
            setShowAddModal(false);
            updateStats();
        }
    };

    const updateStats = () => {
        const totalBudget = departments.reduce((sum, dept) => {
            const budget = dept.budget?.replace(/[$,]/g, '') || '0';
            return sum + parseFloat(budget);
        }, 0);
        
        setStats({
            totalDepartments: departments.length,
            totalEmployees: departments.reduce((sum, dept) => sum + (dept.employees || 0), 0),
            totalBudget: `$${(totalBudget / 1000000).toFixed(2)}M`
        });
    };

    const handleDeleteDepartment = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await DeleteDepartment(id);
                notify('Department deleted successfully!', 'success');
                fetchDepartments();
            } catch (error) {
                // Fallback: remove from local state
                const updated = departments.filter(dept => dept._id !== id && dept.id !== id);
                setDepartments(updated);
                saveDepartments(updated);
                calculateStats(updated);
                notify('Department deleted locally (API not available)', 'success');
            }
        }
    };

    const handleEditDepartment = (dept) => {
        setEditDepartment({
            _id: dept._id || dept.id,
            name: dept.name,
            manager: dept.manager || '',
            budget: dept.budget || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateDepartment = () => {
        if (editDepartment.name && editDepartment.manager && editDepartment.budget) {
            const updatedDepartments = departments.map(dept => 
                (dept._id === editDepartment._id || dept.id === editDepartment._id) 
                    ? { ...dept, name: editDepartment.name, manager: editDepartment.manager, budget: editDepartment.budget }
                    : dept
            );
            setDepartments(updatedDepartments);
            saveDepartments(updatedDepartments);
            calculateStats(updatedDepartments);
            setShowEditModal(false);
            notify('Department updated successfully!', 'success');
        }
    };

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title" style={{color: '#ffffff'}}>Department Management</h2>
                <p className="page-subtitle" style={{color: '#ffffff'}}>Manage organizational departments and their details</p>
            </div>

            {/* Department Statistics */}
            <div className="stats-grid" style={{ marginBottom: '30px' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <h3 className="stat-card-title">Total Departments</h3>
                        <div className="stat-card-icon primary">
                            <i className="bi bi-building"></i>
                        </div>
                    </div>
                    <h2 className="stat-card-value">{stats.totalDepartments || departments.length}</h2>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <h3 className="stat-card-title">Total Employees</h3>
                        <div className="stat-card-icon success">
                            <i className="bi bi-people"></i>
                        </div>
                    </div>
                    <h2 className="stat-card-value">{stats.totalEmployees || departments.reduce((sum, dept) => sum + (dept.employees || 0), 0)}</h2>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <h3 className="stat-card-title">Total Budget</h3>
                        <div className="stat-card-icon warning">
                            <i className="bi bi-currency-dollar"></i>
                        </div>
                    </div>
                    <h2 className="stat-card-value">{stats.totalBudget || '$0'}</h2>
                </div>
            </div>

            {/* Departments Table */}
            <div className="modern-card">
                <div className="card-header">
                    <h3 className="card-title">
                        <i className="bi bi-building me-2"></i>
                        Departments Directory
                    </h3>
                    <button 
                        style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            color: '#000000',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.boxShadow = '0 12px 30px rgba(251, 191, 36, 0.6)';
                            e.target.style.transform = 'translateY(-3px) scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                            e.target.style.transform = 'translateY(0) scale(1)';
                        }}
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Department
                    </button>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Department Name</th>
                                    <th>Manager</th>
                                    <th>Employees</th>
                                    <th>Budget</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <div className="spinner-border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : departments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <i className="bi bi-building fs-1 mb-3 d-block" style={{ color: '#667eea' }}></i>
                                            <h5>No departments found</h5>
                                            <p className="text-muted">Add your first department to get started</p>
                                        </td>
                                    </tr>
                                ) : departments.map(dept => (
                                    <tr key={dept.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="stat-card-icon primary me-3" style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                                                    <i className="bi bi-building"></i>
                                                </div>
                                                <span className="fw-semibold">{dept.name}</span>
                                            </div>
                                        </td>
                                        <td>{dept.manager || 'Not assigned'}</td>
                                        <td>
                                            <span className="modern-badge">{dept.employees || 0}</span>
                                        </td>
                                        <td className="fw-semibold">{dept.budget || '$0'}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="btn btn-sm" 
                                                    style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px' }}
                                                    onClick={() => handleEditDepartment(dept)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm" 
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px' }}
                                                    onClick={() => handleDeleteDepartment(dept._id || dept.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Department Modal */}
            {showAddModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Department</h5>
                                <button 
                                    className="btn-close" 
                                    onClick={() => setShowAddModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group mb-3">
                                    <label className="form-label"><i className="bi bi-building-fill me-2" style={{ color: '#3b82f6' }}></i>Department Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newDepartment.name}
                                        onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                                        placeholder="Enter department name"
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label"><i className="bi bi-person-fill-gear me-2" style={{ color: '#10b981' }}></i>Manager</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newDepartment.manager}
                                        onChange={(e) => setNewDepartment({...newDepartment, manager: e.target.value})}
                                        placeholder="Enter manager name"
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label"><i className="bi bi-currency-dollar me-2" style={{ color: '#f59e0b' }}></i>Budget</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newDepartment.budget}
                                        onChange={(e) => setNewDepartment({...newDepartment, budget: e.target.value})}
                                        placeholder="e.g., $500,000"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    style={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 20px',
                                        color: '#000000',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.boxShadow = '0 12px 30px rgba(251, 191, 36, 0.6)';
                                        e.target.style.transform = 'translateY(-3px) scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                        e.target.style.transform = 'translateY(0) scale(1)';
                                    }}
                                    onClick={handleAddDepartment}
                                >
                                    Add Department
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Department Modal */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Department</h5>
                                <button 
                                    className="btn-close" 
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group mb-3">
                                    <label className="form-label"><i className="bi bi-building-fill me-2"></i>Department Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editDepartment.name}
                                        onChange={(e) => setEditDepartment({...editDepartment, name: e.target.value})}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label"><i className="bi bi-person-fill-gear me-2"></i>Manager</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editDepartment.manager}
                                        onChange={(e) => setEditDepartment({...editDepartment, manager: e.target.value})}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label"><i className="bi bi-currency-dollar me-2"></i>Budget</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editDepartment.budget}
                                        onChange={(e) => setEditDepartment({...editDepartment, budget: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    style={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 20px',
                                        color: '#000000',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                                    }}
                                    onClick={handleUpdateDepartment}
                                >
                                    Update Department
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;