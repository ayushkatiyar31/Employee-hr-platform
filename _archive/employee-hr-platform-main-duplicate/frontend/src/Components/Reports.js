import React, { useState, useEffect } from 'react';
import { notify } from '../utils';

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isGenerating, setIsGenerating] = useState(false);

    const reportTypes = [
        { id: 'employee-summary', name: 'Employee Summary Report', description: 'Complete overview of all employees' },
        { id: 'department-analysis', name: 'Department Analysis', description: 'Department-wise employee distribution' },
        { id: 'salary-report', name: 'Salary Report', description: 'Salary analysis and statistics' },
        { id: 'attendance-report', name: 'Attendance Report', description: 'Employee attendance tracking' },
        { id: 'performance-report', name: 'Performance Report', description: 'Employee performance metrics' }
    ];

    const [recentReports, setRecentReports] = useState([]);

    useEffect(() => {
        const savedReports = localStorage.getItem('recentReports');
        if (savedReports) {
            setRecentReports(JSON.parse(savedReports));
        }
    }, []);

    const saveReports = (reports) => {
        localStorage.setItem('recentReports', JSON.stringify(reports));
    };

    const handleGenerateReport = () => {
        if (!selectedReport) {
            alert('Please select a report type');
            return;
        }

        setIsGenerating(true);
        
        // Simulate report generation
        setTimeout(() => {
            const reportName = reportTypes.find(r => r.id === selectedReport)?.name;
            const newReport = {
                id: Date.now(),
                name: `${reportName} - ${new Date().toLocaleDateString()}`,
                date: new Date().toISOString().split('T')[0],
                status: 'Completed',
                size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`
            };
            
            const updatedReports = [newReport, ...recentReports];
            setRecentReports(updatedReports);
            saveReports(updatedReports);
            setIsGenerating(false);
            notify(`${reportName} has been generated successfully!`, 'success');
        }, 2000);
    };

    const handleDownloadReport = (reportName) => {
        alert(`Downloading ${reportName}... In a real application, this would download the actual file.`);
    };

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title" style={{color: '#ffffff'}}>Reports & Analytics</h2>
                <p className="page-subtitle" style={{color: '#ffffff'}}>Generate and download various HR reports</p>
            </div>

            {/* Report Generation */}
            <div className="modern-card" style={{ marginBottom: '30px' }}>
                <div className="card-header">
                    <h3 className="card-title" style={{ fontWeight: 'bold', color: '#000000' }}>
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Generate New Report
                    </h3>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group mb-3">
                                <label className="form-label" style={{ fontWeight: 'bold', color: '#000000' }}>Report Type</label>
                                <select 
                                    className="form-control"
                                    value={selectedReport}
                                    onChange={(e) => setSelectedReport(e.target.value)}
                                >
                                    <option value="">Select a report type</option>
                                    {reportTypes.map(report => (
                                        <option key={report.id} value={report.id}>
                                            {report.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedReport && (
                                    <small className="text-muted">
                                        {reportTypes.find(r => r.id === selectedReport)?.description}
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group mb-3">
                                <label className="form-label" style={{ fontWeight: 'bold', color: '#000000' }}>Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group mb-3">
                                <label className="form-label" style={{ fontWeight: 'bold', color: '#000000' }}>End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                />
                            </div>
                        </div>
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
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                            opacity: isGenerating ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isGenerating) {
                                e.target.style.boxShadow = '0 12px 30px rgba(251, 191, 36, 0.6)';
                                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isGenerating) {
                                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                e.target.style.transform = 'translateY(0) scale(1)';
                            }
                        }}
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-download me-2"></i>
                                Generate Report
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Report Cards */}
            <div className="row mb-4">
                {reportTypes.slice(0, 3).map(report => (
                    <div key={report.id} className="col-md-4 mb-3">
                        <div className="quick-action-btn h-100" onClick={() => {
                            setSelectedReport(report.id);
                            setIsGenerating(true);
                            setTimeout(() => {
                                const newReport = {
                                    id: Date.now(),
                                    name: `${report.name} - ${new Date().toLocaleDateString()}`,
                                    date: new Date().toISOString().split('T')[0],
                                    status: 'Completed',
                                    size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`
                                };
                                
                                const updatedReports = [newReport, ...recentReports];
                                setRecentReports(updatedReports);
                                saveReports(updatedReports);
                                setIsGenerating(false);
                                notify(`${report.name} has been generated successfully!`, 'success');
                            }, 2000);
                        }}>
                            <div className="quick-action-icon">
                                <i className="bi bi-file-earmark-bar-graph"></i>
                            </div>
                            <h5 className="quick-action-title">{report.name}</h5>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 0 0' }}>
                                {report.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Reports */}
            <div className="modern-card">
                <div className="card-header">
                    <h3 className="card-title" style={{ fontWeight: 'bold', color: '#000000' }}>
                        <i className="bi bi-clock-history me-2"></i>
                        Recent Reports
                    </h3>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th style={{ color: '#000000', fontWeight: 'bold' }}>Report Name</th>
                                    <th style={{ color: '#000000', fontWeight: 'bold' }}>Generated Date</th>
                                    <th style={{ color: '#000000', fontWeight: 'bold' }}>Status</th>
                                    <th style={{ color: '#000000', fontWeight: 'bold' }}>File Size</th>
                                    <th style={{ color: '#000000', fontWeight: 'bold' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <i className="bi bi-file-earmark fs-1 mb-3 d-block" style={{ color: '#667eea' }}></i>
                                            <h5>No reports generated yet</h5>
                                            <p className="text-muted">Generate your first report to see it here</p>
                                        </td>
                                    </tr>
                                ) : recentReports.map(report => (
                                    <tr key={report.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="stat-card-icon info me-3" style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                                                    <i className="bi bi-file-earmark-pdf"></i>
                                                </div>
                                                <span className="fw-semibold">{report.name}</span>
                                            </div>
                                        </td>
                                        <td>{new Date(report.date).toLocaleDateString()}</td>
                                        <td>
                                            <span className="status-badge active">
                                                <i className="bi bi-check-circle me-1"></i>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td>{report.size}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="btn btn-sm" 
                                                    style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px' }}
                                                    onClick={() => handleDownloadReport(report.name)}
                                                >
                                                    <i className="bi bi-download"></i>
                                                </button>
                                                <button className="btn btn-sm" style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px' }}>
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm" 
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px' }}
                                                    onClick={() => {
                                                        const updatedReports = recentReports.filter(r => r.id !== report.id);
                                                        setRecentReports(updatedReports);
                                                        saveReports(updatedReports);
                                                        notify('Report deleted successfully!', 'success');
                                                    }}
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
        </div>
    );
};

export default Reports;