import React, { useEffect, useState, useCallback } from 'react';
import EmployeeTable from './EmployeeTable';
import AddEmployee from './AddEmployee';
import Header from './Header';
import Dashboard from './Dashboard';
import AdminPanel from './AdminPanel';
import LoadingSpinner from './LoadingSpinner';
import { DeleteEmployeeById, GetAllEmployees } from '../api';
import { ToastContainer } from 'react-toastify';
import { notify } from '../utils';
import { useDebounce } from '../hooks/useDebounce';


const EmployeeManagementApp = () => {
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');
    const [loading, setLoading] = useState(false);
    const [pageTransition, setPageTransition] = useState(false);
    const [employeeObj, setEmployeeObj] = useState(null)
    const [employeesData, setEmployeesData] = useState({
        employees: [],
        pagination: {
            currentPage: 1,
            pageSize: 5,
            totalEmployees: 0,
            totalPages: 0
        }
    });

    const fetchEmployees = async (search = '', page = 1, limit = 100) => {
        console.log('🚀 fetchEmployees called with:', { search, page, limit });
        setLoading(true);
        try {
            const data = await GetAllEmployees(search, page, limit);
            console.log('🚀 fetchEmployees received data:', data);
            
            if (data && data.employees && Array.isArray(data.employees)) {
                console.log('🚀 Setting employees data:', data.employees.length, 'employees');
                setEmployeesData(data);
            } else {
                console.log('🚀 No employees found, setting empty data');
                setEmployeesData({
                    employees: [],
                    pagination: {
                        currentPage: 1,
                        pageSize: 100,
                        totalEmployees: 0,
                        totalPages: 0
                    }
                });
            }
        } catch (err) {
            console.error('🚀 Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    useEffect(() => {
        if (currentPage === 'employees') {
            fetchEmployees(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm, currentPage]);

    const handleUpdateEmployee = useCallback(async (emp) => {
        setEmployeeObj(emp);
        setShowModal(true);
    }, []);
    
    const handlePageTransition = useCallback((page) => {
        setPageTransition(true);
        setTimeout(() => {
            setCurrentPage(page);
            if (page === 'dashboard' || page === 'employees') {
                fetchEmployees();
            }
            setPageTransition(false);
        }, 300);
    }, []);
    
    const handleNavigation = useCallback((page) => {
        if (page !== currentPage) {
            handlePageTransition(page);
        }
    }, [currentPage, handlePageTransition]);
    
    const handleAddEmployeeFromHeader = useCallback(() => {
        setShowModal(true);
    }, []);

    // Initial load
    useEffect(() => {
        fetchEmployees();
    }, []);
    
    // Refresh when page changes
    useEffect(() => {
        if (currentPage === 'employees' || currentPage === 'dashboard') {
            fetchEmployees();
        }
    }, [currentPage]);

    // Auto-refresh every 30 seconds when on employee/dashboard pages
    useEffect(() => {
        let interval;
        if (currentPage === 'employees' || currentPage === 'dashboard') {
            interval = setInterval(() => {
                fetchEmployees('', 1, 100);
            }, 30000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [currentPage]);

    const renderContent = () => {
        if (pageTransition) {
            return <LoadingSpinner message="Loading page..." />;
        }
        
        switch (currentPage) {
            case 'dashboard':
                return (
                    <div className="page-transition">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="text-white mb-0">
                                <i className="bi bi-speedometer2 me-2"></i>
                                Dashboard Overview
                            </h4>
                            <button className="btn btn-outline-light btn-sm" onClick={() => fetchEmployees()}>
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                Refresh Data
                            </button>
                        </div>
                        {loading ? <LoadingSpinner message="Loading dashboard..." /> : <Dashboard 
                            employeesData={employeesData} 
                            onNavigate={(page) => {
                                console.log('Dashboard onNavigate called with:', page);
                                handleNavigation(page);
                            }} 
                            onAddEmployee={() => {
                                console.log('Dashboard onAddEmployee called');
                                handleAddEmployeeFromHeader();
                            }} 
                        />}
                    </div>
                );
            case 'employees':
                return (
                    <div className="page-transition">
                        <div className='d-flex justify-content-between align-items-center mb-4'>
                            <div style={{background: '#000000', padding: '15px', borderRadius: '8px', border: '2px solid #ffff00'}}>
                                <h4 style={{color: '#ffff00', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold'}}>
                                    👥 Employee Management
                                </h4>
                                <p style={{color: '#ffff00', margin: '0', fontSize: '14px'}}>
                                    Manage your organization's workforce ({employeesData.employees.length} employees)
                                </p>
                            </div>
                            <div className='d-flex gap-3 align-items-center'>
                                <button className='btn btn-outline-light btn-sm' onClick={() => fetchEmployees()}>
                                    <i className='bi bi-arrow-clockwise me-2'></i>
                                    Refresh
                                </button>
                                <div className='position-relative' style={{ width: '300px' }}>
                                    <i className='bi bi-search position-absolute' style={{
                                        left: '15px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#666'
                                    }}></i>
                                    <input
                                        onChange={handleSearch}
                                        type="text"
                                        placeholder="Search employees..."
                                        className='form-control search-input ps-5'
                                        style={{ paddingLeft: '45px' }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {loading ? (
                            <LoadingSpinner message="Loading employees..." />
                        ) : (
                            <EmployeeTable
                                employees={employeesData.employees}
                                pagination={employeesData.pagination}
                                fetchEmployees={fetchEmployees}
                                handleUpdateEmployee={handleUpdateEmployee}
                                loading={loading}
                            />
                        )}
                    </div>
                );
            case 'admin':
                return <AdminPanel />;
            default:
                return (
                    <div className='vertical-buttons-container mb-5 page-transition'>
                        <button className='btn btn-primary big-action-btn dashboard-btn d-flex align-items-center justify-content-center gap-4'
                            onClick={() => handlePageTransition('dashboard')}>
                            <i className='bi bi-graph-up fs-2'></i>
                            Dashboard
                        </button>
                        <button className='btn btn-primary big-action-btn employees-btn d-flex align-items-center justify-content-center gap-4'
                            onClick={() => handlePageTransition('employees')}>
                            <i className='bi bi-table fs-2'></i>
                            View Employees
                        </button>
                        <button className='btn btn-primary big-action-btn add-btn d-flex align-items-center justify-content-center gap-4'
                            onClick={() => setShowModal(true)}>
                            <i className='bi bi-plus-circle fs-2'></i>
                            Add Employee
                        </button>
                    </div>
                );
        }
    };
    
    return (
        <div className='min-vh-100'>
            <Header onNavigate={handleNavigation} currentPage={currentPage} onAddEmployee={handleAddEmployeeFromHeader} />
            
            <div className='d-flex flex-column justify-content-center align-items-center w-100 p-3 fade-in-up'>
                <h1 className='app-title mb-5' style={{
                    fontSize: '3.5rem',
                    fontWeight: '700',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    color: '#ffffff'
                }}>Employee Management System</h1>
                
                <div className="w-100 d-flex justify-content-center mt-4">
                    <div className='glass-card p-4' style={{ width: '95%', maxWidth: '1400px' }}>
                        {renderContent()}
                    </div>
                </div>
                
                <ToastContainer
                    position='top-right'
                    autoClose={4000}
                    hideProgressBar={false}
                    theme='colored'
                />
            </div>
            
            <AddEmployee
                fetchEmployees={fetchEmployees}
                showModal={showModal}
                setShowModal={setShowModal}
                employeeObj={employeeObj}
            />
        </div>
    );
};

export default EmployeeManagementApp;