import React, { useState, useEffect, useRef } from 'react';
import { notify } from '../utils';
import '../scrollbar.css';
import '../card-effects.css';
import { addScrollHandler } from '../scrollHandler';

const ProfessionalDepartmentDirectory = () => {
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDepartment, setNewDepartment] = useState({ name: '', manager: '', budget: '', description: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, department: null });
    const [refreshKey, setRefreshKey] = useState(0);
    const scrollRef = useRef(null);

    const getEmployeeCountForDepartment = (deptName) => {
        // Force re-render by accessing refreshKey
        const _ = refreshKey;
        const employees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
        return employees.filter(emp => emp.department && emp.department.toLowerCase().trim() === deptName.toLowerCase().trim()).length;
    };

    const getPerformancePercentage = (deptName) => {
        // Force re-render by accessing refreshKey
        const _ = refreshKey;
        const employees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
        const totalEmployees = employees.length;
        const deptEmployees = employees.filter(emp => emp.department && emp.department.toLowerCase().trim() === deptName.toLowerCase().trim()).length;
        return totalEmployees > 0 ? Math.round((deptEmployees / totalEmployees) * 100) : 0;
    };

    useEffect(() => {
        const savedDepartments = localStorage.getItem('departments');
        if (savedDepartments) {
            try {
                const parsed = JSON.parse(savedDepartments);
                if (Array.isArray(parsed)) {
                    setDepartments(parsed);
                } else {
                    setDepartments([]);
                }
            } catch (e) {
                setDepartments([]);
            }
        } else {
            setDepartments([]);
        }
        
        if (scrollRef.current) {
            addScrollHandler(scrollRef.current);
        }
    }, []);

    // Refresh employee counts when component becomes visible
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshKey(prev => prev + 1);
        }, 2000); // Refresh every 2 seconds
        
        return () => clearInterval(interval);
    }, []);

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.manager.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddDepartment = () => {
        if (newDepartment.name && newDepartment.manager) {
            notify('Adding department...', 'info');
            const newDept = {
                _id: Date.now().toString(),
                ...newDepartment,
                employees: 0,
                createdAt: new Date().toISOString()
            };
            const updated = [...departments, newDept];
            setDepartments(updated);
            localStorage.setItem('departments', JSON.stringify(updated));
            setNewDepartment({ name: '', manager: '', budget: '', description: '' });
            setShowAddModal(false);
            notify('Department added successfully!', 'success');
            
            // Trigger dashboard update
            window.dispatchEvent(new Event('dataUpdated'));
        } else {
            notify('Please fill all required fields', 'error');
        }
    };

    const handleDeleteClick = (department) => {
        setDeleteConfirm({ show: true, department });
    };

    const handleDeleteConfirm = () => {
        notify('Deleting department...', 'info');
        const updated = departments.filter(dept => dept._id !== deleteConfirm.department._id);
        setDepartments(updated);
        localStorage.setItem('departments', JSON.stringify(updated));
        notify('Department deleted successfully!', 'success');
        setDeleteConfirm({ show: false, department: null });
    };

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#2d3748', padding: '20px', borderRadius: '12px' }}>
            <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', marginBottom: '16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>🏢 Department Directory</h2>
                        <p style={{ margin: 0, color: '#d1d5db' }}>{departments.length} departments</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '200px', fontWeight: 'bold' }}
                        />
                        <button 
                            onClick={() => setShowAddModal(true)} 
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
                            + Add Department
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', overflow: 'hidden' }}>
                <div ref={scrollRef} className="auto-hide-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', padding: '8px', paddingBottom: '150px' }}>
                    {filteredDepartments.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.1rem' }}>
                            No departments found
                        </div>
                    ) : (
                        filteredDepartments.map(department => (
                            <div key={department._id} className="hover-card" style={{ background: '#374151', borderRadius: '12px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                            🏢
                                        </div>
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>{department.name}</h3>
                                            <p style={{ margin: 0, color: '#d1d5db' }}><i className="bi bi-person-fill" style={{ color: '#10b981' }}></i> {department.manager}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleDeleteClick(department)} style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px', textAlign: 'center', overflow: 'hidden' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'white', wordBreak: 'break-all', lineHeight: '1.2' }}>{getEmployeeCountForDepartment(department.name)}</div>
                                        <div style={{ fontSize: '12px', color: '#d1d5db' }}>Employees</div>
                                    </div>
                                    <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px', textAlign: 'center', overflow: 'hidden' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'white', wordBreak: 'break-all', lineHeight: '1.2' }}>{getPerformancePercentage(department.name)}%</div>
                                        <div style={{ fontSize: '12px', color: '#d1d5db' }}>Share</div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '14px', fontWeight: '600' }}>Description</h4>
                                    <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>{department.description || 'No description available'}</p>
                                </div>
                            </div>
                        ))
                    )}
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90vw' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Add New Department</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#374151' }}>Department Name</label>
                            <input
                                type="text"
                                value={newDepartment.name}
                                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                placeholder="Enter department name"
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#374151' }}>Manager</label>
                            <input
                                type="text"
                                value={newDepartment.manager}
                                onChange={(e) => setNewDepartment({...newDepartment, manager: e.target.value})}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                placeholder="Enter manager name"
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#374151' }}>Description</label>
                            <textarea
                                value={newDepartment.description}
                                onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '60px', resize: 'vertical' }}
                                placeholder="Enter department description"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={handleAddDepartment} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                Add Department
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {deleteConfirm.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90vw' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#ef4444' }}>Delete Department</h3>
                        <p style={{ margin: '0 0 20px 0', color: '#374151' }}>Are you sure you want to delete {deleteConfirm.department?.name}?</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setDeleteConfirm({ show: false, department: null })} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalDepartmentDirectory;
