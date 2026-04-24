import React, { useState } from 'react';
import { notify } from '../utils';

const GenerateReport = ({ showModal, setShowModal }) => {
    const [selectedReport, setSelectedReport] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isGenerating, setIsGenerating] = useState(false);

    const reportTypes = [
        { id: 'employee-summary', name: 'Employee Summary Report', description: 'Complete overview of all employees' },
        { id: 'department-analysis', name: 'Department Analysis', description: 'Department-wise employee distribution' },
        { id: 'salary-report', name: 'Salary Report', description: 'Salary analysis and statistics' },
        { id: 'attendance-report', name: 'Attendance Report', description: 'Employee attendance tracking' },
        { id: 'performance-report', name: 'Performance Report', description: 'Employee performance metrics' },
        { id: 'leave-analysis', name: 'Leave Analysis', description: 'Leave patterns and trends' }
    ];

    const handleGenerateReport = () => {
        if (!selectedReport) {
            notify('Please select a report type', 'warning');
            return;
        }

        setIsGenerating(true);
        
        setTimeout(() => {
            const reportName = reportTypes.find(r => r.id === selectedReport)?.name;
            
            // Save report to localStorage
            const newReport = {
                id: Date.now(),
                name: `${reportName} - ${new Date().toLocaleDateString()}`,
                date: new Date().toISOString().split('T')[0],
                status: 'Completed',
                size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
                type: selectedReport,
                dateRange: dateRange
            };
            
            const existingReports = JSON.parse(localStorage.getItem('recentReports') || '[]');
            const updatedReports = [newReport, ...existingReports];
            localStorage.setItem('recentReports', JSON.stringify(updatedReports));
            
            notify(`${reportName} generated successfully!`, 'success');
            setIsGenerating(false);
            setSelectedReport('');
            setDateRange({ start: '', end: '' });
            setShowModal(false);
        }, 2000);
    };

    const handleClose = () => {
        setSelectedReport('');
        setDateRange({ start: '', end: '' });
        setShowModal(false);
    };

    if (!showModal) return null;

    return (
        <div className="modal fade show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg" style={{ margin: 0 }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-file-earmark-text me-2"></i>
                            Generate Report
                        </h5>
                        <button type="button" className="btn btn-outline-secondary" onClick={handleClose} style={{ padding: '4px 8px' }}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group mb-3">
                                    <label className="form-label">Report Type</label>
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
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="spinner-border spinner-border-sm me-2"></div>
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
            </div>
        </div>
    );
};

export default GenerateReport;
