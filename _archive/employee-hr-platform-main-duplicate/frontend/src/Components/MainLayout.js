import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import Dashboard from './Dashboard';
import EmployeeTable from './EmployeeTable';
import AddEmployee from './AddEmployee';
import LoadingSpinner from './LoadingSpinner';
import Departments from './Departments';
import Reports from './Reports';
import Settings from './Settings';
import LeaveManagement from './LeaveManagement';
import { DashboardShimmer, EmployeeTableShimmer } from './ShimmerUI';
import { QuickActionShimmer } from './ButtonShimmer';
import { GetAllEmployees } from '../api';
import { ToastContainer } from 'react-toastify';
import { notify } from '../utils';

const MainLayout = ({ user, onLogout }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [employeeObj, setEmployeeObj] = useState(null);
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
            // Check cache first for faster loading
            const cacheKey = `employees_${search}_${page}_${limit}`;
            const cachedData = sessionStorage.getItem(cacheKey);
            const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
            
            // Use cache if less than 5 minutes old
            if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < 300000) {
                setEmployeesData(JSON.parse(cachedData));
                setLoading(false);
                return;
            }
            
            // Skip API - use only local storage
            const localEmployees = JSON.parse(localStorage.getItem('localEmployees') || '[]');
            
            // Filter by search if provided
            const filteredEmployees = search ? 
                localEmployees.filter(emp => 
                    emp.name.toLowerCase().includes(search.toLowerCase()) ||
                    emp.email.toLowerCase().includes(search.toLowerCase()) ||
                    emp.department.toLowerCase().includes(search.toLowerCase())
                ) : localEmployees;
            
            const localData = {
                employees: filteredEmployees,
                pagination: {
                    currentPage: 1,
                    pageSize: 100,
                    totalEmployees: filteredEmployees.length,
                    totalPages: Math.ceil(filteredEmployees.length / 100)
                }
            };
            setEmployeesData(localData);
        } catch (err) {
            console.error('Fetch error:', err);
            // Silent fail - no popup notification
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        fetchEmployees(searchTerm);
    };

    const handleUpdateEmployee = async (emp) => {
        setEmployeeObj(emp);
        setShowModal(true);
    };

    const handleNavigation = async (page) => {
        if (page !== currentPage) {
            setPageLoading(true);
            setCurrentPage(page);
            
            // Simulate loading for data-heavy pages
            if (page === 'dashboard' || page === 'employees') {
                await fetchEmployees();
            } else {
                // Add small delay for consistent UX
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            setPageLoading(false);
        }
    };

    // Handle add employee action
    const handleAddEmployee = () => {
        setShowModal(true);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Clear any pending timeouts or intervals
            sessionStorage.removeItem('employees_cache');
        };
    }, []);

    const renderContent = () => {
        if (pageLoading) {
            switch (currentPage) {
                case 'dashboard':
                    return <DashboardShimmer />;
                case 'employees':
                    return (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2 className="page-title">Employee Management</h2>
                                    <p className="page-subtitle">Manage your organization's workforce</p>
                                </div>
                                <button className="btn btn-primary" disabled>
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Add Employee
                                </button>
                            </div>
                            <EmployeeTableShimmer />
                        </div>
                    );
                default:
                    return (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                            <div className="spinner"></div>
                        </div>
                    );
            }
        }

        switch (currentPage) {
            case 'dashboard':
                return loading ? (
                    <DashboardShimmer />
                ) : (
                    <Dashboard employeesData={employeesData} onNavigate={handleNavigation} onAddEmployee={handleAddEmployee} />
                );
            
            case 'employees':
                return loading ? (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2 className="page-title" style={{color: '#ffffff'}}>Employee Management</h2>
                                <p className="page-subtitle" style={{color: '#ffffff'}}>Manage your organization's workforce</p>
                            </div>
                            <button className="btn btn-primary" disabled>
                                <i className="bi bi-plus-circle me-2"></i>
                                Add Employee
                            </button>
                        </div>
                        <EmployeeTableShimmer />
                    </div>
                ) : (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2 className="page-title" style={{color: '#ffffff'}}>Employee Management</h2>
                                <p className="page-subtitle" style={{color: '#ffffff'}}>Manage your organization's workforce</p>
                            </div>
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
                                onClick={() => setShowModal(true)}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Add Employee
                            </button>
                        </div>
                        <EmployeeTable
                            employees={employeesData.employees}
                            pagination={employeesData.pagination}
                            fetchEmployees={fetchEmployees}
                            handleUpdateEmployee={handleUpdateEmployee}
                            loading={loading}
                        />
                    </div>
                );
            
            case 'departments':
                return <Departments />;
            
            case 'reports':
                return <Reports />;
            
            case 'leaves':
                return <LeaveManagement />;
            
            case 'settings':
                return <Settings />;
            
            default:
                return <Dashboard employeesData={employeesData} onNavigate={handleNavigation} onAddEmployee={handleAddEmployee} />;
        }
    };

    return (
        <div className="app-layout">
            <Sidebar 
                collapsed={sidebarCollapsed}
                currentPage={currentPage}
                onNavigate={handleNavigation}
                onToggle={toggleSidebar}
                pageLoading={pageLoading}
            />
            
            <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
                <TopHeader 
                    collapsed={sidebarCollapsed}
                    onToggleSidebar={toggleSidebar}
                    currentPage={currentPage}
                    user={user}
                    onSearch={currentPage === 'employees' ? handleSearch : null}
                />
                
                <div className="content-area">
                    {renderContent()}
                </div>
            </div>

            <AddEmployee
                fetchEmployees={fetchEmployees}
                showModal={showModal}
                setShowModal={setShowModal}
                employeeObj={employeeObj}
            />

            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                theme="colored"
            />
        </div>
    );
};

export default MainLayout;