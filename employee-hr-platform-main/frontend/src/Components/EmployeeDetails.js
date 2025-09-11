// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';

// import { GetEmployeeDetailsById } from '../api';

// const EmployeeDetails = () => {
//     const navigate = useNavigate();
//     const { id } = useParams();
//     const [employee, setEmployee] = useState({});

//     const fetchEmployeeDetails = async () => {
//         try {
//             const data = await GetEmployeeDetailsById(id);
//             setEmployee(data);
//         } catch (err) {
//             alert('Error', err);
//         }
//     }
//     useEffect(() => {
//         fetchEmployeeDetails();
//     }, [id])

//     if (!employee) {
//         return <div>Employee not found</div>;
//     }

//     return (
//         <div className="container mt-5">
//             <div className="card">
//                 <div className="card-header">
//                     <h2>Employee Details</h2>
//                 </div>
//                 <div className="card-body">
//                     <div className="row mb-3">
//                         <div className="col-md-3">
//                             <img
//                                 src={employee.profileImage}
//                                 alt={employee.name}
//                                 className="img-fluid rounded"
//                             />
//                         </div>
//                         <div className="col-md-9">
//                             <h4>{employee.name}</h4>
//                             <p><strong>Email:</strong> {employee.email}</p>
//                             <p><strong>Phone:</strong> {employee.phone}</p>
//                             <p><strong>Department:</strong> {employee.department}</p>
//                             <p><strong>Salary:</strong> {employee.salary}</p>
//                         </div>
//                     </div>
//                     <button className="btn btn-primary" onClick={() => navigate('/employee')}>
//                         Back
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EmployeeDetails;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { GetEmployeeDetailsById } from '../api';

const EmployeeDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [notFound, setNotFound] = useState(false);

    const fetchEmployeeDetails = async () => {
        try {
            const data = await GetEmployeeDetailsById(id);

            if (data && Object.keys(data).length > 0) {
                setEmployee(data);
                setNotFound(false);
            } else {
                setNotFound(true);
            }
        } catch (err) {
            setNotFound(true);
        }
    }

    useEffect(() => {
        fetchEmployeeDetails();
    }, [id]);

    if (notFound) {
        return (
            <div className="container mt-5">
                <div className="employee-details-glass p-5 text-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <i className="bi bi-exclamation-triangle" style={{ fontSize: '4rem', color: '#fbbf24' }}></i>
                    <h3 className="mt-3 employee-detail-text">Employee Not Found</h3>
                    <p className="employee-detail-label">The employee you're looking for doesn't exist.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/employee')}>
                        <i className="bi bi-arrow-left me-2"></i>Back to Employees
                    </button>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="container mt-5">
                <div className="employee-details-glass p-5 text-center" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: '#667eea' }}></div>
                    <h4 className="mt-3 employee-detail-text">Loading Employee Details...</h4>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 fade-in-up">
            <div className="employee-details-glass p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="d-flex align-items-center mb-4">
                    <button className="btn btn-outline-primary me-3" onClick={() => navigate('/employee')}>
                        <i className="bi bi-arrow-left me-2"></i>Back
                    </button>
                    <h2 className="mb-0 employee-detail-text" style={{ fontSize: '2rem' }}>
                        <i className="bi bi-person-badge me-2"></i>Employee Details
                    </h2>
                </div>
                
                <div className="row">
                    <div className="col-md-4 text-center mb-4">
                        <div className="position-relative d-inline-block">
                            <img
                                src={employee.profileImage || 'https://via.placeholder.com/200x200?text=No+Image'}
                                alt={employee.name}
                                className="img-fluid rounded-circle shadow"
                                style={{ width: '200px', height: '200px', objectFit: 'cover', border: '4px solid #667eea' }}
                            />
                            <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" style={{ width: '30px', height: '30px', border: '3px solid white' }}></div>
                        </div>
                    </div>
                    
                    <div className="col-md-8">
                        <div className="mb-4">
                            <h3 className="employee-detail-text mb-4" style={{ fontSize: '2.5rem' }}>{employee.name}</h3>
                            
                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="employee-detail-card d-flex align-items-center p-3 rounded">
                                        <i className="bi bi-envelope-fill me-3 fs-5" style={{ color: '#dc2626' }}></i>
                                        <div>
                                            <small className="employee-detail-label d-block">Email Address</small>
                                            <strong className="employee-detail-text">{employee.email}</strong>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-12">
                                    <div className="employee-detail-card d-flex align-items-center p-3 rounded">
                                        <i className="bi bi-telephone-fill me-3 fs-5" style={{ color: '#059669' }}></i>
                                        <div>
                                            <small className="employee-detail-label d-block">Phone Number</small>
                                            <strong className="employee-detail-text">{employee.phone}</strong>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-12">
                                    <div className="employee-detail-card d-flex align-items-center p-3 rounded">
                                        <i className="bi bi-building-fill me-3 fs-5" style={{ color: '#fff' }}></i>
                                        <div>
                                            <small className="employee-detail-label d-block">Department</small>
                                            <span className="badge" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontSize: '14px', padding: '8px 16px' }}>
                                                {employee.department}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-12">
                                    <div className="employee-detail-card d-flex align-items-center p-3 rounded">
                                        <i className="bi bi-currency-dollar me-3 fs-5" style={{ color: '#fff' }}></i>
                                        <div>
                                            <small className="employee-detail-label d-block">Salary</small>
                                            <strong className="employee-detail-text" style={{ color: '#4ade80', fontSize: '1.2rem' }}>${employee.salary}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetails;

