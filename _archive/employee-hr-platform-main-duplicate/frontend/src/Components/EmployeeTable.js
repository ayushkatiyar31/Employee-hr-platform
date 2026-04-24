import React, { useState } from 'react'
// import { DeleteEmployeeById } from '../api'; // Not needed for localStorage
import { notify } from '../utils';
import ConfirmDialog from './ConfirmDialog';
import { TableSkeleton } from './LoadingSpinner';


function EmployeeTable({
    employees, pagination,
    fetchEmployees, handleUpdateEmployee, loading }) {
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, employee: null });
    
    const [statusFilter, setStatusFilter] = useState('all');
    
    const headers = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'phone', label: 'Phone', sortable: false },
        { key: 'department', label: 'Department', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false }
    ];
    
    const getEmployeeStatus = (employee) => {
        // Simulate status based on some logic or add status field to your backend
        const statuses = ['active', 'inactive', 'on-leave'];
        return employee.status || statuses[Math.floor(Math.random() * statuses.length)];
    };
    
    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { class: 'status-badge active', icon: 'bi-check-circle-fill', text: 'Active' },
            inactive: { class: 'status-badge inactive', icon: 'bi-x-circle-fill', text: 'Inactive' },
            'on-leave': { class: 'status-badge on-leave', icon: 'bi-clock-fill', text: 'On Leave' }
        };
        return statusConfig[status] || statusConfig.active;
    };
    
    const filteredEmployees = employees.filter(emp => {
        if (statusFilter === 'all') return true;
        return getEmployeeStatus(emp) === statusFilter;
    });
    
    const { currentPage, totalPages } = pagination || {};

    const handlePagination = (currentPage) => {
        fetchEmployees('', currentPage, 5)
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePagination(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handlePagination(currentPage - 1);
        }
    };

    const handleSort = (field) => {
        if (!field) return;
        
        const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);
        
        // Sort employees locally for demo (in real app, this would be server-side)
        const sortedEmployees = [...employees].sort((a, b) => {
            const aVal = a[field]?.toLowerCase() || '';
            const bVal = b[field]?.toLowerCase() || '';
            
            if (direction === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });
        
        // Update the employees data (this is a simplified approach)
        // In a real app, you'd call the API with sort parameters
    };
    
    const handleDeleteClick = (employee) => {
        setDeleteConfirm({ show: true, employee });
    };
    
    const handleDeleteConfirm = () => {
        try {
            // Delete from localStorage only
            const localEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
            const updatedEmployees = localEmployees.filter(emp => emp._id !== deleteConfirm.employee._id);
            localStorage.setItem('localEmployees', JSON.stringify(updatedEmployees));
            
            notify('Employee deleted successfully!', 'success');
            fetchEmployees();
        } catch (err) {
            notify('Failed to delete employee', 'error');
        } finally {
            setDeleteConfirm({ show: false, employee: null });
        }
    };
    
    const handleDeleteCancel = () => {
        setDeleteConfirm({ show: false, employee: null });
    };


    const TableRow = ({ employee, onEdit, onDelete }) => {
        const status = getEmployeeStatus(employee);
        const statusConfig = getStatusBadge(status);
        
        return (
            <tr className='align-middle'>
                <td>
                    <div className='d-flex align-items-center'>
                        <div className='avatar-circle me-3' style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <span 
                                className="fw-semibold"
                                style={{ color: '#1e293b', cursor: 'pointer' }}
                                onClick={() => console.log('View employee details:', employee._id)}
                            >
                                {employee.name}
                            </span>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {employee._id.slice(-6)}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div className='d-flex align-items-center'>
                        <i className='bi bi-envelope me-2' style={{ color: '#dc2626' }}></i>
                        <span style={{ color: '#374151' }}>{employee.email}</span>
                    </div>
                </td>
                <td>
                    <div className='d-flex align-items-center'>
                        <i className='bi bi-telephone me-2' style={{ color: '#059669' }}></i>
                        <span style={{ color: '#374151' }}>{employee.phone}</span>
                    </div>
                </td>
                <td>
                    <span className='modern-badge'>
                        <i className='bi bi-building me-1'></i>
                        {employee.department}
                    </span>
                </td>
                <td>
                    <span className={statusConfig.class}>
                        <i className={`bi ${statusConfig.icon} me-1`}></i>
                        {statusConfig.text}
                    </span>
                </td>
                <td>
                    <div className='d-flex justify-content-center gap-2'>
                        <button
                            className='btn btn-sm'
                            style={{
                                background: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 10px'
                            }}
                            onClick={() => onEdit(employee)}
                        >
                            <i className='bi bi-pencil-fill'></i>
                        </button>
                        <button
                            className='btn btn-sm'
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 10px'
                            }}
                            onClick={() => onDelete(employee)}
                        >
                            <i className='bi bi-trash-fill'></i>
                        </button>
                    </div>
                </td>
            </tr>
        );
    };
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <>
            {loading ? (
                <TableSkeleton />
            ) : (
                <div className='table-container'>
                    <div className='table-header'>
                        <div>
                            <h3 className='card-title mb-1'>Employee Directory</h3>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                                {filteredEmployees.length} employees found
                            </p>
                        </div>
                        <div className='table-actions'>
                            <div className='d-flex gap-2'>
                                <button 
                                    className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    All
                                </button>
                                <button 
                                    className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('active')}
                                >
                                    Active
                                </button>
                                <button 
                                    className={`filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('inactive')}
                                >
                                    Inactive
                                </button>
                                <button 
                                    className={`filter-btn ${statusFilter === 'on-leave' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('on-leave')}
                                >
                                    On Leave
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='table-responsive'>
                        <table className='table table-hover mb-0'>
                        <thead>
                            <tr>
                                {
                                    headers.map((header, i) => (
                                        <th 
                                            key={i} 
                                            className={`text-center ${header.sortable ? 'sortable-header' : ''}`}
                                            onClick={() => handleSort(header.sortable ? header.key : null)}
                                        >
                                            {header.label}
                                            {header.sortable && (
                                                <i className={`bi bi-arrow-${sortField === header.key && sortDirection === 'desc' ? 'down' : 'up'} sort-icon ${sortField === header.key ? 'active' : ''}`}></i>
                                            )}
                                        </th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredEmployees.length === 0 ? 
                                <tr>
                                    <td colSpan={headers.length} className='text-center py-5'>
                                        <div className='d-flex flex-column align-items-center'>
                                            <i className='bi bi-inbox fs-1 mb-3' style={{ color: '#667eea' }}></i>
                                            <h5 style={{ color: '#1e293b' }}>No employees found</h5>
                                            <p style={{ color: '#64748b' }}>Try adjusting your search or filter criteria</p>
                                        </div>
                                    </td>
                                </tr>
                                : filteredEmployees.map((emp) => (
                                    <TableRow 
                                        employee={emp} 
                                        key={emp._id} 
                                        onEdit={handleUpdateEmployee}
                                        onDelete={handleDeleteClick}
                                    />
                                ))
                            }
                        </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination-container d-flex justify-content-between align-items-center">
                    <span className="modern-badge">Page {currentPage} of {totalPages}</span>
                    <div className='d-flex gap-2 align-items-center'>
                        <button
                            className="btn btn-outline-primary"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            style={{ minWidth: '100px' }}
                        >
                            <i className='bi bi-chevron-left'></i> Previous
                        </button>
                        
                        {pageNumbers.slice(
                            Math.max(0, currentPage - 2),
                            Math.min(totalPages, currentPage + 1)
                        ).map(page => (
                            <button
                                key={page}
                                className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handlePagination(page)}
                                style={{ minWidth: '45px' }}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button
                            className="btn btn-outline-primary"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            style={{ minWidth: '100px' }}
                        >
                            Next <i className='bi bi-chevron-right'></i>
                        </button>
                    </div>
                </div>
            )}
            <ConfirmDialog
                show={deleteConfirm.show}
                title="Delete Employee"
                message={`Are you sure you want to delete ${deleteConfirm.employee?.name}? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                type="danger"
            />
        </>
    )
}

export default EmployeeTable