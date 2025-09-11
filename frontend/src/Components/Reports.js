import React, { useState, useEffect } from 'react';
import { notify } from '../utils';

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isGenerating, setIsGenerating] = useState(false);


    const reportTypes = [
        { id: 'employee-summary', name: 'Employee Summary Report', description: 'Complete overview of all employees', icon: 'bi-people-fill' },
        { id: 'department-analysis', name: 'Department Analysis', description: 'Department-wise employee distribution', icon: 'bi-building-fill' },
        { id: 'salary-report', name: 'Salary Report', description: 'Salary analysis and statistics', icon: 'bi-currency-dollar' },
        { id: 'attendance-report', name: 'Attendance Report', description: 'Employee attendance tracking', icon: 'bi-calendar-check-fill' },
        { id: 'performance-report', name: 'Performance Report', description: 'Employee performance metrics', icon: 'bi-graph-up-arrow' },
        { id: 'leave-analysis', name: 'Leave Analysis', description: 'Leave patterns and trends', icon: 'bi-calendar-event-fill' }
    ];

    const [recentReports, setRecentReports] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReportForView, setSelectedReportForView] = useState(null);

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
            notify('Please select a report type', 'warning');
            return;
        }

        setIsGenerating(true);
        
        setTimeout(() => {
            const reportName = reportTypes.find(r => r.id === selectedReport)?.name;
            const newReport = {
                id: Date.now(),
                name: `${reportName} - ${new Date().toLocaleDateString()}`,
                date: new Date().toISOString().split('T')[0],
                status: 'Completed',
                size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
                type: selectedReport
            };
            
            const updatedReports = [newReport, ...recentReports];
            setRecentReports(updatedReports);
            saveReports(updatedReports);
            setIsGenerating(false);
            setSelectedReport('');
            setDateRange({ start: '', end: '' });
            notify(`${reportName} generated successfully!`, 'success');
        }, 2000);
    };

    const handleQuickGenerate = (reportType) => {
        setIsGenerating(true);
        setTimeout(() => {
            const newReport = {
                id: Date.now(),
                name: `${reportType.name} - ${new Date().toLocaleDateString()}`,
                date: new Date().toISOString().split('T')[0],
                status: 'Completed',
                size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
                type: reportType.id
            };
            
            const updatedReports = [newReport, ...recentReports];
            setRecentReports(updatedReports);
            saveReports(updatedReports);
            setIsGenerating(false);
            notify(`${reportType.name} generated successfully!`, 'success');
        }, 1500);
    };

    const handleDownloadReport = (reportName) => {
        notify(`Downloading ${reportName}...`, 'info');
    };

    const handleViewReport = (report) => {
        setSelectedReportForView(report);
        setShowReportModal(true);
        notify(`Opening ${report.name}...`, 'info');
    };

    return (
        <>
        <style>
        {`
            .no-scrollbar {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .table tbody tr:hover {
                background: #787d8c !important;
                color: #ffffff !important;
            }
            .table tbody tr {
                background: #787d8c !important;
                color: #ffffff !important;
            }
            .table tbody td {
                background: #787d8c !important;
                color: #ffffff !important;
                border-color: #374151 !important;
            }
            .table thead th {
                background: #1f2937 !important;
                color: #ffffff !important;
                border-color: #374151 !important;
            }
        `}
        </style>
        <div className="no-scrollbar" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="page-header">
                <h2 className="page-title" style={{color: '#ffffff'}}>Reports & Analytics</h2>
                <p className="page-subtitle" style={{color: '#ffffff'}}>Generate and download various HR reports</p>
            </div>



            {/* Report Generation */}
            <div style={{ marginBottom: '30px', background: '#1f2937', border: 'none', borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-header" style={{ background: '#1f2937', border: 'none', borderBottom: 'none' }}>
                    <h3 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '600', margin: '0', display: 'flex', alignItems: 'center' }}>
                        <i className="bi bi-file-earmark-text me-2" style={{ color: '#ffffff', fontSize: '24px' }}></i>
                        Generate New Report
                    </h3>
                </div>
                <div className="card-body" style={{ background: '#1f2937', border: 'none', borderTop: 'none', borderBottom: 'none' }}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group mb-3">
                                <label className="form-label" style={{ fontWeight: 'bold', color: '#ffffff' }}>Report Type</label>
                                <select 
                                    className="form-control"
                                    style={{ background: '#374151', color: '#ffffff', border: '1px solid #6b7280' }}
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
                                <label className="form-label" style={{ fontWeight: 'bold', color: '#ffffff' }}>Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    style={{ background: '#374151', color: '#ffffff', border: '1px solid #6b7280' }}
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group mb-3">
                                <label className="form-label" style={{ fontWeight: 'bold', color: '#ffffff' }}>End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    style={{ background: '#374151', color: '#ffffff', border: '1px solid #6b7280' }}
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    <button 
                        style={{
                            background: '#00ff00',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            color: '#000000',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(0, 255, 0, 0.4)',
                            opacity: isGenerating ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isGenerating) {
                                e.target.style.boxShadow = '0 12px 30px rgba(0, 255, 0, 0.6)';
                                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isGenerating) {
                                e.target.style.boxShadow = '0 4px 15px rgba(0, 255, 0, 0.4)';
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

            {/* Recent Reports */}
            <div className="modern-card dark-card">
                <div className="card-header">
                    <h3 className="card-title" style={{ color: 'white' }}>
                        <i className="bi bi-clock-history me-2" style={{ color: '#ffffff !important' }}></i>
                        Recent Reports
                    </h3>
                </div>
                <div className="card-body" style={{ background: '#1f2937 !important' }}>
                
                <div className="table-responsive">
                    {recentReports.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-file-earmark fs-1 mb-3" style={{ color: '#ffffff' }}></i>
                            <h5 style={{ color: '#ffffff' }}>No reports generated yet</h5>
                            <p style={{ color: '#d1d5db' }}>Generate your first report to see it here</p>
                        </div>
                    ) : (
                        <table className="table" style={{ background: '#1f2937', color: '#ffffff' }}>
                            <thead>
                                <tr>
                                    <th style={{ fontWeight: 'bold', color: '#ffffff' }}>Report Name</th>
                                    <th style={{ fontWeight: 'bold', color: '#ffffff' }}>Date</th>
                                    <th style={{ fontWeight: 'bold', color: '#ffffff' }}>Status</th>
                                    <th style={{ fontWeight: 'bold', color: '#ffffff' }}>Size</th>
                                    <th style={{ fontWeight: 'bold', color: '#ffffff' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentReports.map(report => (
                                    <tr key={report.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                                                <span style={{ color: '#ffffff' }}>{report.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#ffffff' }}>{new Date(report.date).toLocaleDateString()}</td>
                                        <td>
                                            <span className="badge bg-success">
                                                <i className="bi bi-check-circle me-1" style={{ color: '#00ff00' }}></i>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td style={{ color: '#ffffff' }}>{report.size}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button 
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleDownloadReport(report.name)}
                                                    title="Download"
                                                >
                                                    <i className="bi bi-download"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => handleViewReport(report)}
                                                    title="View"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => {
                                                        const updatedReports = recentReports.filter(r => r.id !== report.id);
                                                        setRecentReports(updatedReports);
                                                        saveReports(updatedReports);
                                                        notify('Report deleted successfully!', 'success');
                                                    }}
                                                    title="Delete"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                </div>
            </div>

            {/* Report View Modal */}
            {showReportModal && selectedReportForView && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#1f2937',
                        borderRadius: '15px',
                        padding: '30px',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '80%',
                        overflowY: 'auto',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ color: 'white', margin: 0 }}>
                                <i className="bi bi-file-earmark-text me-2"></i>
                                {selectedReportForView.name}
                            </h3>
                            <button 
                                onClick={() => setShowReportModal(false)}
                                style={{
                                    background: '#dc2626',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        
                        <div style={{ background: '#374151', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                            <h4 style={{ color: '#10b981', marginBottom: '15px' }}>Report Details</h4>
                            <p><strong>Generated:</strong> {new Date(selectedReportForView.date).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> <span style={{ color: '#10b981' }}>{selectedReportForView.status}</span></p>
                            <p><strong>File Size:</strong> {selectedReportForView.size}</p>
                            <p><strong>Report Type:</strong> {selectedReportForView.type}</p>
                        </div>

                        <div style={{ background: '#374151', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                            <h4 style={{ color: '#3b82f6', marginBottom: '15px' }}>Report Content Preview</h4>
                            <div style={{ background: '#1f2937', padding: '15px', borderRadius: '8px', fontFamily: 'monospace' }}>
                                <p>📊 <strong>Executive Summary</strong></p>
                                <p>• Total Records Processed: {Math.floor(Math.random() * 500) + 100}</p>
                                <p>• Data Analysis Period: {new Date(selectedReportForView.date).toLocaleDateString()}</p>
                                <p>• Report Generation Time: {new Date().toLocaleTimeString()}</p>
                                <br/>
                                <p>📈 <strong>Key Metrics</strong></p>
                                <p>• Performance Score: {Math.floor(Math.random() * 40) + 60}%</p>
                                <p>• Completion Rate: {Math.floor(Math.random() * 20) + 80}%</p>
                                <p>• Quality Index: {(Math.random() * 2 + 3).toFixed(1)}/5.0</p>
                                <br/>
                                <p style={{ color: '#10b981' }}>✅ Report generated successfully with all data validated</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => handleDownloadReport(selectedReportForView.name)}
                                style={{
                                    background: '#10b981',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="bi bi-download me-2"></i>
                                Download
                            </button>
                            <button 
                                onClick={() => setShowReportModal(false)}
                                style={{
                                    background: '#6b7280',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default Reports;
