import React, { useState, useEffect, useRef } from 'react';
import { notify } from '../utils';
import ConfirmDialog from './ConfirmDialog';
import '../scrollbar.css';
import '../card-effects.css';
import { addScrollHandler } from '../scrollHandler';

function ProfessionalEmployeeDirectory({ employees, fetchEmployees, handleUpdateEmployee, loading }) {
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, employee: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const scrollRef = useRef(null);
    
    useEffect(() => {
        if (scrollRef.current) {
            addScrollHandler(scrollRef.current);
        }
    }, []);

    const getEmployeeStatus = (employee) => employee.status || 'active';

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || getEmployeeStatus(emp) === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDeleteClick = (employee) => setDeleteConfirm({ show: true, employee });

    const handleDeleteConfirm = async () => {
        notify('Deleting employee...', 'info');
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const localEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
            const updatedEmployees = localEmployees.filter(emp => emp._id !== deleteConfirm.employee._id);
            localStorage.setItem('localEmployees', JSON.stringify(updatedEmployees));
            notify('Employee deleted successfully!', 'success');
            fetchEmployees();
            window.dispatchEvent(new Event('dataUpdated'));
        } catch (err) {
            notify('Failed to delete employee', 'error');
        } finally {
            setDeleteConfirm({ show: false, employee: null });
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#2d3748', padding: '20px', borderRadius: '12px' }}>
            {/* Fixed Header */}
            <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', marginBottom: '16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>👥 Employee Directory</h2>
                        <p style={{ margin: 0, color: '#d1d5db' }}>{employees.length} employees</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '200px', fontWeight: 'bold' }}
                        />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on-leave">On Leave</option>
                        </select>

                        <button 
                            onClick={() => handleUpdateEmployee(null)} 
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
                            + Add Employee
                        </button>
                    </div>
                </div>
            </div>

            {/* Fixed Content Area */}
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', overflow: 'hidden' }}>
                {viewMode === 'grid' ? (
                    <div ref={scrollRef} className="auto-hide-scrollbar" style={{ height: '400px', overflowY: 'auto', padding: '8px 8px 20px 8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                        {filteredEmployees.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.1rem' }}>
                                No employees found
                            </div>
                        ) : (
                            filteredEmployees.map(employee => (
                                <div key={employee._id} className="hover-card" style={{ background: '#374151', borderRadius: '12px', padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div 
                                                style={{ 
                                                    width: '56px', 
                                                    height: '56px', 
                                                    borderRadius: '12px', 
                                                    background: employee.profileImage ? 'transparent' : '#ff6b35', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    color: '#ffffff', 
                                                    fontWeight: '900', 
                                                    fontSize: '1.5rem', 
                                                    overflow: 'hidden',
                                                    cursor: employee.profileImage ? 'pointer' : 'default'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (employee.profileImage) {
                                                        const tooltip = document.createElement('div');
                                                        tooltip.id = 'image-tooltip';
                                                        tooltip.style.cssText = `
                                                            position: fixed;
                                                            z-index: 9999;
                                                            background: white;
                                                            border: 2px solid #ddd;
                                                            border-radius: 8px;
                                                            padding: 4px;
                                                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                                                            left: ${e.clientX + 10}px;
                                                            top: ${e.clientY + 10}px;
                                                        `;
                                                        tooltip.innerHTML = `<img src="${employee.profileImage}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 4px;" />`;
                                                        document.body.appendChild(tooltip);
                                                    }
                                                }}
                                                onMouseLeave={() => {
                                                    const tooltip = document.getElementById('image-tooltip');
                                                    if (tooltip) tooltip.remove();
                                                }}
                                            >
                                                {employee.profileImage ? (
                                                    <img src={employee.profileImage} alt={employee.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={() => console.log('Image failed to load:', employee.profileImage)} />
                                                ) : (
                                                    employee.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>{employee.name}</h3>
                                                <p style={{ margin: 0, color: '#d1d5db' }}>🏢 {employee.department}</p>
                                            </div>
                                        </div>
                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px', 
                                            fontWeight: '600', 
                                            textTransform: 'uppercase',
                                            background: getEmployeeStatus(employee) === 'active' ? '#dcfce7' : getEmployeeStatus(employee) === 'inactive' ? '#fee2e2' : '#fef3c7',
                                            color: getEmployeeStatus(employee) === 'active' ? '#166534' : getEmployeeStatus(employee) === 'inactive' ? '#991b1b' : '#92400e'
                                        }}>
                                            {getEmployeeStatus(employee)}
                                        </span>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ color: '#d1d5db', fontSize: '12px', marginBottom: '4px' }}>Email</div>
                                            <div style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}><i className="bi bi-envelope" style={{ color: '#ef4444', marginRight: '6px' }}></i>{employee.email}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#d1d5db', fontSize: '12px', marginBottom: '4px' }}>Phone</div>
                                            <div style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}><i className="bi bi-telephone" style={{ color: '#10b981', marginRight: '6px' }}></i>{employee.phone}</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ color: '#d1d5db', fontSize: '12px', marginBottom: '4px' }}>Salary</div>
                                        <div style={{ fontWeight: '600', color: 'white', fontSize: '16px' }}><i className="bi bi-currency-dollar" style={{ color: '#f59e0b', marginRight: '6px' }}></i>{employee.salary}</div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={() => handleUpdateEmployee(employee)}
                                            style={{ flex: 1, padding: '8px', background: '#fcd34d', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                                        >
                                            <span style={{ color: '#ef4444' }}>✏️</span> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(employee)}
                                            style={{ flex: 1, padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        </div>
                    </div>
                ) : (
                    <div style={{ height: '100%', overflowY: 'auto', background: 'white', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Employee</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Department</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Salary</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No employees found</td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map(employee => (
                                        <tr key={employee._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ff6b35', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '14px', fontWeight: '900' }}>
                                                        {employee.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {employee.name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px' }}>{employee.email}</td>
                                            <td style={{ padding: '12px' }}>{employee.department}</td>
                                            <td style={{ padding: '12px' }}>{employee.salary}</td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button onClick={() => handleUpdateEmployee(employee)} style={{ padding: '6px 8px', background: '#fbbf24', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><i className="bi bi-pencil"></i></button>
                                                    <button onClick={() => handleDeleteClick(employee)} style={{ padding: '6px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><i className="bi bi-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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
