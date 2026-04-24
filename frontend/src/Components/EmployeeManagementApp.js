import React, { useEffect, useState, useCallback } from 'react';
import EmployeeTable from './EmployeeTable';
import ProfessionalEmployeeDirectory from './ProfessionalEmployeeDirectory';
import ProfessionalDepartmentDirectory from './ProfessionalDepartmentDirectory';
import ProfessionalLeaveManagement from './ProfessionalLeaveManagement';
import AddEmployee from './AddEmployee';
import GenerateReport from './GenerateReport';
import LeaveForm from './LeaveForm';
import Header from './Header';
import Dashboard from './Dashboard';
import Reports from './Reports';
import LoadingSpinner from './LoadingSpinner';
import { DeleteEmployeeById, GetAllEmployees } from '../api';
import { ToastContainer } from 'react-toastify';
import { notify } from '../utils';
import { useDebounce } from '../hooks/useDebounce';


const EmployeeManagementApp = () => {
    const [showModal, setShowModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
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
        setLoading(true);
        try {
            const localEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
            
            const filteredEmployees = search ? 
                localEmployees.filter(emp => 
                    emp.name.toLowerCase().includes(search.toLowerCase()) ||
                    emp.email.toLowerCase().includes(search.toLowerCase()) ||
                    emp.department.toLowerCase().includes(search.toLowerCase())
                ) : localEmployees;
            
            setEmployeesData({
                employees: filteredEmployees,
                pagination: {
                    currentPage: 1,
                    pageSize: 100,
                    totalEmployees: filteredEmployees.length,
                    totalPages: Math.ceil(filteredEmployees.length / 100)
                }
            });
        } catch (err) {
            console.error('Fetch error:', err);
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
    
    const handleGenerateReport = useCallback(() => {
        setShowReportModal(true);
    }, []);
    
    const handleLeaveForm = useCallback(() => {
        setShowLeaveModal(true);
    }, []);

    // Initial load
    useEffect(() => {
        // Add demo employees if none exist
        const existing = localStorage.getItem('localEmployees');
        if (!existing || JSON.parse(existing).length === 0) {
            const demoEmployees = [
                {
                    _id: '1',
                    name: 'John Doe',
                    email: 'john@company.com',
                    phone: '123-456-7890',
                    department: 'Engineering',
                    position: 'Engineering',
                    salary: '75000',
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    name: 'Jane Smith',
                    email: 'jane@company.com',
                    phone: '098-765-4321',
                    department: 'Marketing',
                    position: 'Marketing',
                    salary: '65000',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('localEmployees', JSON.stringify(demoEmployees));
        }
        fetchEmployees();
    }, []);
    


    const renderContent = () => {
        if (pageTransition) {
            return <LoadingSpinner message="Loading page..." />;
        }
        
        switch (currentPage) {
            case 'dashboard':
                return (
                    <div className="page-transition">
                        <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '0px' }}>
                            <h4 className="text-white mb-0">
                                <i className="bi bi-speedometer2 me-2"></i>
                                Dashboard Overview
                            </h4>
                        </div>
                        <div style={{ height: '100%', overflowY: 'auto' }}>
                            {loading ? <LoadingSpinner message="Loading dashboard..." /> : <Dashboard 
                                key="dashboard"
                                employeesData={employeesData} 
                                onNavigate={(page) => {
                                    console.log('Dashboard onNavigate called with:', page);
                                    handleNavigation(page);
                                }} 
                                onAddEmployee={() => {
                                    console.log('Dashboard onAddEmployee called');
                                    handleAddEmployeeFromHeader();
                                }}
                                onGenerateReport={() => {
                                    console.log('Dashboard onGenerateReport called');
                                    handleGenerateReport();
                                }}
                                onLeaveForm={() => {
                                    console.log('Dashboard onLeaveForm called');
                                    handleLeaveForm();
                                }} 
                            />}
                        </div>
                    </div>
                );
            case 'employees':
                return (
                    <div style={{ height: '100%', overflow: 'hidden' }}>
                        <ProfessionalEmployeeDirectory
                            key="employees"
                            employees={employeesData.employees}
                            fetchEmployees={fetchEmployees}
                            handleUpdateEmployee={handleUpdateEmployee}
                            loading={loading}
                        />
                    </div>
                );
            case 'departments':
                return (
                    <div style={{ height: '100%', overflow: 'hidden' }}>
                        <ProfessionalDepartmentDirectory key="departments" />
                    </div>
                );
            case 'leaves':
                return (
                    <div style={{ height: '100%', overflow: 'hidden' }}>
                        <ProfessionalLeaveManagement key="leaves" />
                    </div>
                );
            case 'reports':
                return (
                    <div style={{ height: '100%', overflow: 'hidden' }}>
                        <Reports key="reports" />
                    </div>
                );
            default:
                handlePageTransition('dashboard');
                return null;
        }
    };
    
    return (
        <div style={{ minHeight: '100vh', background: '#2d3748' }}>
            <Header onNavigate={handleNavigation} currentPage={currentPage} onAddEmployee={handleAddEmployeeFromHeader} user={JSON.parse(localStorage.getItem('user') || '{}')} />
            
            <div style={{ position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0, background: '#2d3748' }}>
                <div style={{ width: '100%', height: '100%', padding: '0px 20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
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
            
            <GenerateReport
                showModal={showReportModal}
                setShowModal={setShowReportModal}
            />
            
            <LeaveForm
                showModal={showLeaveModal}
                setShowModal={setShowLeaveModal}
            />
        </div>
    );
};

export default EmployeeManagementApp;
