import React, { useState } from 'react';

const AdminPanel = () => {
    const [systemStats, setSystemStats] = useState({
        serverStatus: 'Online',
        dbConnections: 45,
        memoryUsage: '68%',
        cpuUsage: '42%'
    });

    const [logs, setLogs] = useState([
        { id: 1, type: 'info', message: 'User login successful', timestamp: '2024-01-15 10:30:25' },
        { id: 2, type: 'warning', message: 'High memory usage detected', timestamp: '2024-01-15 10:25:12' },
        { id: 3, type: 'error', message: 'Database connection timeout', timestamp: '2024-01-15 10:20:45' },
        { id: 4, type: 'success', message: 'Backup completed successfully', timestamp: '2024-01-15 10:15:30' }
    ]);

    const handleClearLogs = () => {
        setLogs([]);
    };

    const handleRefreshStats = () => {
        setSystemStats({
            ...systemStats,
            dbConnections: Math.floor(Math.random() * 100),
            memoryUsage: Math.floor(Math.random() * 100) + '%',
            cpuUsage: Math.floor(Math.random() * 100) + '%'
        });
    };

    const getLogIcon = (type) => {
        switch (type) {
            case 'error': return 'bi-exclamation-triangle-fill text-danger';
            case 'warning': return 'bi-exclamation-circle-fill text-warning';
            case 'success': return 'bi-check-circle-fill text-success';
            default: return 'bi-info-circle-fill text-info';
        }
    };

    return (
        <div className="admin-panel page-transition">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-white mb-0">
                    <i className="bi bi-gear-fill me-2"></i>
                    Admin Control Panel
                </h3>
                <button className="admin-btn" onClick={handleRefreshStats}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh Stats
                </button>
            </div>

            {/* System Statistics */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="admin-card text-center">
                        <i className="bi bi-server fs-2 text-success mb-2"></i>
                        <h5 className="text-white">Server Status</h5>
                        <p className="text-success fw-bold mb-0">{systemStats.serverStatus}</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="admin-card text-center">
                        <i className="bi bi-database fs-2 text-info mb-2"></i>
                        <h5 className="text-white">DB Connections</h5>
                        <p className="text-info fw-bold mb-0">{systemStats.dbConnections}</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="admin-card text-center">
                        <i className="bi bi-memory fs-2 text-warning mb-2"></i>
                        <h5 className="text-white">Memory Usage</h5>
                        <p className="text-warning fw-bold mb-0">{systemStats.memoryUsage}</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="admin-card text-center">
                        <i className="bi bi-cpu fs-2 text-danger mb-2"></i>
                        <h5 className="text-white">CPU Usage</h5>
                        <p className="text-danger fw-bold mb-0">{systemStats.cpuUsage}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-card mb-4">
                <h5 className="text-white mb-3">
                    <i className="bi bi-lightning-fill me-2"></i>
                    Quick Actions
                </h5>
                <div className="row g-3">
                    <div className="col-md-2">
                        <button className="btn btn-outline-light w-100">
                            <i className="bi bi-download d-block mb-1"></i>
                            <small>Backup DB</small>
                        </button>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-outline-light w-100">
                            <i className="bi bi-arrow-clockwise d-block mb-1"></i>
                            <small>Restart Server</small>
                        </button>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-outline-light w-100">
                            <i className="bi bi-trash d-block mb-1"></i>
                            <small>Clear Cache</small>
                        </button>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-outline-light w-100">
                            <i className="bi bi-file-earmark-text d-block mb-1"></i>
                            <small>Export Logs</small>
                        </button>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-outline-light w-100">
                            <i className="bi bi-shield-check d-block mb-1"></i>
                            <small>Security Scan</small>
                        </button>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-outline-light w-100">
                            <i className="bi bi-graph-up d-block mb-1"></i>
                            <small>Performance</small>
                        </button>
                    </div>
                </div>
            </div>

            {/* System Logs */}
            <div className="admin-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-white mb-0">
                        <i className="bi bi-journal-text me-2"></i>
                        System Logs
                    </h5>
                    <button className="btn btn-outline-danger btn-sm" onClick={handleClearLogs}>
                        <i className="bi bi-trash me-1"></i>
                        Clear Logs
                    </button>
                </div>
                
                <div className="logs-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {logs.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="bi bi-inbox fs-1 text-muted mb-2"></i>
                            <p className="text-muted">No logs available</p>
                        </div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="log-item d-flex align-items-start p-2 mb-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <i className={`bi ${getLogIcon(log.type)} me-3 mt-1`}></i>
                                <div className="flex-grow-1">
                                    <p className="text-white mb-1">{log.message}</p>
                                    <small className="text-muted">{log.timestamp}</small>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;