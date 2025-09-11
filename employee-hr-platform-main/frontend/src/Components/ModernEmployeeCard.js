import React from 'react';

const ModernEmployeeCard = ({ employee, onEdit, onDelete, onClick }) => {
    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getDepartmentColor = (department) => {
        const colors = {
            'Engineering': '#3b82f6',
            'Marketing': '#10b981',
            'Sales': '#f59e0b',
            'HR': '#8b5cf6',
            'Finance': '#ef4444',
            'Operations': '#06b6d4'
        };
        return colors[department] || '#64748b';
    };

    return (
        <div className="employee-card" onClick={() => onClick && onClick(employee)}>
            <div className="employee-card-header">
                <div className="employee-avatar-container">
                    {employee.profileImage ? (
                        <img 
                            src={employee.profileImage} 
                            alt={employee.name}
                            className="employee-avatar"
                        />
                    ) : (
                        <div 
                            className="employee-avatar-placeholder"
                            style={{ backgroundColor: getDepartmentColor(employee.department) }}
                        >
                            {getInitials(employee.name)}
                        </div>
                    )}
                    <div className="employee-status-indicator active"></div>
                </div>
                
                <div className="employee-actions">
                    <div className="dropdown">
                        <button 
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            data-bs-toggle="dropdown"
                        >
                            <i className="bi bi-three-dots"></i>
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <button 
                                    className="dropdown-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(employee);
                                    }}
                                >
                                    <i className="bi bi-pencil me-2"></i>Edit
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="dropdown-item text-danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(employee._id);
                                    }}
                                >
                                    <i className="bi bi-trash me-2"></i>Delete
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="employee-card-body">
                <h3 className="employee-name">{employee.name}</h3>
                <p className="employee-role">{employee.position}</p>
                <p className="employee-email">{employee.email}</p>
                
                <div className="employee-meta">
                    <span 
                        className="employee-department"
                        style={{ 
                            backgroundColor: `${getDepartmentColor(employee.department)}20`,
                            color: getDepartmentColor(employee.department)
                        }}
                    >
                        {employee.department}
                    </span>
                    
                    {employee.phone && (
                        <span className="employee-phone">
                            <i className="bi bi-telephone me-1"></i>
                            {employee.phone}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModernEmployeeCard;