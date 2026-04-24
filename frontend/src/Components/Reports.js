import React, { useEffect, useMemo, useState } from 'react';
import { notify } from '../utils';
import { validateDateRange } from '../validation';

const reportCardStyle = {
    background: '#ffffff',
    borderRadius: '18px',
    border: '1px solid #e2e8f0',
    padding: '18px',
    boxShadow: '0 16px 34px rgba(15, 23, 42, 0.06)'
};

const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: `1px solid ${hasError ? '#dc2626' : '#cbd5e1'}`,
    background: '#f8fafc',
    color: '#0f172a'
});

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [recentReports, setRecentReports] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReportForView, setSelectedReportForView] = useState(null);
    const [dateError, setDateError] = useState('');

    const reportTypes = useMemo(() => ([
        { id: 'employee-summary', name: 'Employee Summary Report', description: 'Complete overview of all employees', accent: '#0f766e' },
        { id: 'department-analysis', name: 'Department Analysis', description: 'Department-wise employee distribution', accent: '#2563eb' },
        { id: 'salary-report', name: 'Salary Report', description: 'Salary analysis and statistics', accent: '#7c3aed' },
        { id: 'attendance-report', name: 'Attendance Report', description: 'Employee attendance tracking', accent: '#d97706' },
        { id: 'performance-report', name: 'Performance Report', description: 'Employee performance metrics', accent: '#db2777' },
        { id: 'leave-analysis', name: 'Leave Analysis', description: 'Leave patterns and trends', accent: '#dc2626' }
    ]), []);

    useEffect(() => {
        const savedReports = localStorage.getItem('recentReports');
        if (savedReports) {
            setRecentReports(JSON.parse(savedReports));
        }
    }, []);

    const saveReports = (reports) => {
        localStorage.setItem('recentReports', JSON.stringify(reports));
    };

    const buildReport = (reportType) => ({
        id: Date.now(),
        name: `${reportType.name} - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
        type: reportType.id,
        range: dateRange.start && dateRange.end ? { ...dateRange } : null
    });

    const validateReportDates = () => {
        if (!dateRange.start && !dateRange.end) {
            setDateError('');
            return '';
        }

        const error = validateDateRange(dateRange.start, dateRange.end, {
            allowPastStart: true,
            maxRangeDays: 365
        });

        setDateError(error);
        return error;
    };

    const handleGenerateReport = () => {
        if (!selectedReport) {
            notify('Please select a report type', 'warning');
            return;
        }

        const error = validateReportDates();
        if (error) {
            notify(error, 'error');
            return;
        }

        setIsGenerating(true);

        setTimeout(() => {
            const reportType = reportTypes.find((item) => item.id === selectedReport);
            const newReport = buildReport(reportType);
            const updatedReports = [newReport, ...recentReports];

            setRecentReports(updatedReports);
            saveReports(updatedReports);
            setIsGenerating(false);
            setSelectedReport('');
            setDateRange({ start: '', end: '' });
            setDateError('');
            notify(`${reportType.name} generated successfully!`, 'success');
        }, 1400);
    };

    const handleQuickGenerate = (reportType) => {
        setSelectedReport(reportType.id);
        setDateError('');
        setIsGenerating(true);

        setTimeout(() => {
            const newReport = buildReport(reportType);
            const updatedReports = [newReport, ...recentReports];
            setRecentReports(updatedReports);
            saveReports(updatedReports);
            setIsGenerating(false);
            notify(`${reportType.name} generated successfully!`, 'success');
        }, 900);
    };

    const handleDownloadReport = (reportName) => {
        notify(`Downloading ${reportName}...`, 'info');
    };

    const handleViewReport = (report) => {
        setSelectedReportForView(report);
        setShowReportModal(true);
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', paddingBottom: '24px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #111827 0%, #1d4ed8 100%)',
                color: 'white',
                borderRadius: '24px',
                padding: '28px',
                marginBottom: '24px'
            }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.9rem' }}>Reports & Analytics</h2>
                <p style={{ margin: 0, color: '#dbeafe', maxWidth: '720px' }}>
                    Generate cleaner HR reports with date-range validation so reports always reflect a sensible period.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={reportCardStyle}>
                    <h3 style={{ margin: '0 0 18px 0', color: '#0f172a' }}>Generate New Report</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#334155' }}>Report Type</label>
                            <select
                                value={selectedReport}
                                onChange={(e) => setSelectedReport(e.target.value)}
                                style={inputStyle(false)}
                            >
                                <option value="">Select a report type</option>
                                {reportTypes.map((report) => (
                                    <option key={report.id} value={report.id}>{report.name}</option>
                                ))}
                            </select>
                            {selectedReport && (
                                <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '13px' }}>
                                    {reportTypes.find((item) => item.id === selectedReport)?.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#334155' }}>Start Date</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => {
                                    setDateRange({ ...dateRange, start: e.target.value });
                                    setDateError('');
                                }}
                                style={inputStyle(Boolean(dateError))}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#334155' }}>End Date</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                min={dateRange.start || undefined}
                                onChange={(e) => {
                                    setDateRange({ ...dateRange, end: e.target.value });
                                    setDateError('');
                                }}
                                style={inputStyle(Boolean(dateError))}
                            />
                        </div>
                    </div>

                    {dateError && (
                        <p style={{ margin: '0 0 14px 0', color: '#b91c1c', fontWeight: '700', fontSize: '13px' }}>{dateError}</p>
                    )}

                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        style={{
                            border: 'none',
                            borderRadius: '999px',
                            padding: '12px 18px',
                            background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '700',
                            opacity: isGenerating ? 0.7 : 1
                        }}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>

                <div style={reportCardStyle}>
                    <h3 style={{ margin: '0 0 18px 0', color: '#0f172a' }}>Quick Reports</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {reportTypes.slice(0, 4).map((report) => (
                            <button
                                key={report.id}
                                onClick={() => handleQuickGenerate(report)}
                                disabled={isGenerating}
                                style={{
                                    textAlign: 'left',
                                    border: `1px solid ${report.accent}22`,
                                    borderRadius: '14px',
                                    padding: '14px',
                                    background: `${report.accent}10`,
                                    color: '#0f172a',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontWeight: '700' }}>{report.name}</div>
                                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{report.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={reportCardStyle}>
                <h3 style={{ margin: '0 0 18px 0', color: '#0f172a' }}>Recent Reports</h3>
                {recentReports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                        No reports generated yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {recentReports.map((report) => (
                            <div key={report.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 0.8fr 0.8fr auto',
                                gap: '14px',
                                alignItems: 'center',
                                border: '1px solid #e2e8f0',
                                borderRadius: '14px',
                                padding: '14px'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{report.name}</div>
                                    <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                                        {report.range ? `${report.range.start} to ${report.range.end}` : 'No custom date range'}
                                    </div>
                                </div>
                                <div style={{ color: '#334155', fontWeight: '600' }}>{new Date(report.date).toLocaleDateString()}</div>
                                <div style={{ color: '#0f766e', fontWeight: '700' }}>{report.size}</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleDownloadReport(report.name)} style={{ border: 'none', borderRadius: '10px', padding: '10px 12px', background: '#0f766e', color: 'white', cursor: 'pointer' }}>
                                        Download
                                    </button>
                                    <button onClick={() => handleViewReport(report)} style={{ border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 12px', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}>
                                        View
                                    </button>
                                    <button
                                        onClick={() => {
                                            const updatedReports = recentReports.filter((item) => item.id !== report.id);
                                            setRecentReports(updatedReports);
                                            saveReports(updatedReports);
                                            notify('Report deleted successfully!', 'success');
                                        }}
                                        style={{ border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 12px', background: '#fff1f2', color: '#b91c1c', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showReportModal && selectedReportForView && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                    <div style={{ width: '100%', maxWidth: '760px', borderRadius: '24px', background: '#ffffff', overflow: 'hidden', boxShadow: '0 30px 80px rgba(15, 23, 42, 0.3)' }}>
                        <div style={{ padding: '22px 24px', background: 'linear-gradient(135deg, #111827 0%, #1d4ed8 100%)', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                <h3 style={{ margin: 0 }}>{selectedReportForView.name}</h3>
                                <button onClick={() => setShowReportModal(false)} style={{ border: 'none', borderRadius: '999px', width: '36px', height: '36px', background: 'rgba(255,255,255,0.18)', color: 'white', cursor: 'pointer' }}>
                                    X
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '24px', display: 'grid', gap: '18px' }}>
                            <div style={{ ...reportCardStyle, boxShadow: 'none' }}>
                                <h4 style={{ marginTop: 0, color: '#0f172a' }}>Report Details</h4>
                                <p><strong>Generated:</strong> {new Date(selectedReportForView.date).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {selectedReportForView.status}</p>
                                <p><strong>File Size:</strong> {selectedReportForView.size}</p>
                                <p><strong>Type:</strong> {selectedReportForView.type}</p>
                                <p><strong>Date Range:</strong> {selectedReportForView.range ? `${selectedReportForView.range.start} to ${selectedReportForView.range.end}` : 'Default dataset window'}</p>
                            </div>

                            <div style={{ ...reportCardStyle, boxShadow: 'none' }}>
                                <h4 style={{ marginTop: 0, color: '#0f172a' }}>Preview</h4>
                                <p style={{ color: '#334155', lineHeight: 1.7 }}>
                                    This preview represents a validated HR analytics report with clean date filtering and a generated snapshot of the selected dataset.
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => handleDownloadReport(selectedReportForView.name)} style={{ border: 'none', borderRadius: '10px', padding: '10px 14px', background: '#0f766e', color: 'white', cursor: 'pointer' }}>
                                    Download
                                </button>
                                <button onClick={() => setShowReportModal(false)} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 14px', background: '#ffffff', color: '#334155', cursor: 'pointer' }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
