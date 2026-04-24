import React, { useState } from 'react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        companyName: 'HR Platform Inc.',
        companyEmail: 'admin@hrplatform.com',
        timezone: 'UTC-5',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        language: 'English',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        weeklyReports: true,
        monthlyReports: true,
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetention: '7years',
        twoFactorAuth: false
    });

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveSettings = () => {
        alert('Settings saved successfully! In a real application, these would be saved to the database.');
    };

    const tabs = [
        { id: 'general', name: 'General', icon: 'bi-gear', color: '#3b82f6' },
        { id: 'notifications', name: 'Notifications', icon: 'bi-bell', color: '#f59e0b' },
        { id: 'security', name: 'Security', icon: 'bi-shield-check', color: '#10b981' },
        { id: 'backup', name: 'Backup & Data', icon: 'bi-cloud-arrow-up', color: '#8b5cf6' }
    ];

    const renderGeneralSettings = () => (
        <div className="row">
            <div className="col-md-6">
                <div className="form-group mb-3">
                    <label className="form-label" style={{color: '#000000', fontWeight: 'bold'}}><i className="bi bi-building-fill me-2"></i>Company Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={settings.companyName}
                        onChange={(e) => handleSettingChange('companyName', e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <label className="form-label" style={{color: '#000000', fontWeight: 'bold'}}><i className="bi bi-envelope-fill me-2"></i>Company Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={settings.companyEmail}
                        onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <label className="form-label" style={{color: '#000000', fontWeight: 'bold'}}>Timezone</label>
                    <select 
                        className="form-control"
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    >
                        <option value="UTC-5">UTC-5 (Eastern Time)</option>
                        <option value="UTC-6">UTC-6 (Central Time)</option>
                        <option value="UTC-7">UTC-7 (Mountain Time)</option>
                        <option value="UTC-8">UTC-8 (Pacific Time)</option>
                    </select>
                </div>
            </div>
            <div className="col-md-6">
                <div className="form-group mb-3">
                    <label className="form-label" style={{color: '#000000', fontWeight: 'bold'}}>Date Format</label>
                    <select 
                        className="form-control"
                        value={settings.dateFormat}
                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                </div>
                <div className="form-group mb-3">
                    <label className="form-label" style={{color: '#000000', fontWeight: 'bold'}}>Currency</label>
                    <select 
                        className="form-control"
                        value={settings.currency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                    >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                    </select>
                </div>
                <div className="form-group mb-3">
                    <label className="form-label" style={{color: '#000000', fontWeight: 'bold'}}>Language</label>
                    <select 
                        className="form-control"
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="row">
            <div className="col-md-6">
                <h5 className="mb-3">Communication Preferences</h5>
                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                    <label className="form-check-label">
                        <i className="bi bi-envelope me-2"></i>
                        Email Notifications
                    </label>
                </div>
                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    />
                    <label className="form-check-label">
                        <i className="bi bi-phone me-2"></i>
                        SMS Notifications
                    </label>
                </div>
                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                    <label className="form-check-label">
                        <i className="bi bi-app-indicator me-2"></i>
                        Push Notifications
                    </label>
                </div>
            </div>
            <div className="col-md-6">
                <h5 className="mb-3">Report Notifications</h5>
                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.weeklyReports}
                        onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                    />
                    <label className="form-check-label">
                        <i className="bi bi-calendar-week me-2"></i>
                        Weekly Reports
                    </label>
                </div>
                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.monthlyReports}
                        onChange={(e) => handleSettingChange('monthlyReports', e.target.checked)}
                    />
                    <label className="form-check-label">
                        <i className="bi bi-calendar-month me-2"></i>
                        Monthly Reports
                    </label>
                </div>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="row">
            <div className="col-md-8">
                <div className="form-check mb-4">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    />
                    <label className="form-check-label">
                        <i className="bi bi-shield-check me-2"></i>
                        Enable Two-Factor Authentication
                    </label>
                    <small className="d-block text-muted">
                        Add an extra layer of security to your account
                    </small>
                </div>
                
                <div className="modern-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="card-body">
                        <h6><i className="bi bi-key me-2"></i>Password Policy</h6>
                        <ul className="list-unstyled mb-0">
                            <li><i className="bi bi-check-circle text-success me-2"></i>Minimum 8 characters</li>
                            <li><i className="bi bi-check-circle text-success me-2"></i>At least one uppercase letter</li>
                            <li><i className="bi bi-check-circle text-success me-2"></i>At least one number</li>
                            <li><i className="bi bi-check-circle text-success me-2"></i>At least one special character</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBackupSettings = () => (
        <div className="row">
            <div className="col-md-6">
                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    />
                    <label className="form-check-label">
                        <i className="bi bi-cloud-arrow-up me-2"></i>
                        Enable Automatic Backup
                    </label>
                </div>
                
                <div className="form-group mb-3">
                    <label className="form-label">Backup Frequency</label>
                    <select 
                        className="form-control"
                        value={settings.backupFrequency}
                        onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                        disabled={!settings.autoBackup}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            </div>
            <div className="col-md-6">
                <div className="form-group mb-3">
                    <label className="form-label">Data Retention Period</label>
                    <select 
                        className="form-control"
                        value={settings.dataRetention}
                        onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                    >
                        <option value="1year">1 Year</option>
                        <option value="3years">3 Years</option>
                        <option value="5years">5 Years</option>
                        <option value="7years">7 Years</option>
                        <option value="indefinite">Indefinite</option>
                    </select>
                </div>
                
                <button className="btn btn-outline-primary">
                    <i className="bi bi-download me-2"></i>
                    Download Backup
                </button>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch(activeTab) {
            case 'general': return renderGeneralSettings();
            case 'notifications': return renderNotificationSettings();
            case 'security': return renderSecuritySettings();
            case 'backup': return renderBackupSettings();
            default: return renderGeneralSettings();
        }
    };

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title" style={{color: '#ffffff'}}>System Settings</h2>
                <p className="page-subtitle" style={{color: '#ffffff'}}>Configure application settings and preferences</p>
            </div>

            <div className="modern-card">
                <div className="card-header">
                    <div className="d-flex gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`filter-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ fontWeight: 'bold' }}
                            >
                                <i className={`bi ${tab.icon} me-2`} style={{ color: tab.color }}></i>
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="card-body">
                    {renderTabContent()}
                    
                    <div className="d-flex justify-content-end mt-4 pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                        <button 
                            className="btn me-2"
                            style={{
                                background: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 20px',
                                color: '#ffffff',
                                fontWeight: '600',
                                boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.5)';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.3)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                            onClick={() => {
                                if (window.confirm('Are you sure you want to reset all settings to default values?')) {
                                    setSettings({
                                        companyName: 'HR Platform Inc.',
                                        companyEmail: 'admin@hrplatform.com',
                                        timezone: 'UTC-5',
                                        dateFormat: 'MM/DD/YYYY',
                                        currency: 'USD',
                                        language: 'English',
                                        emailNotifications: true,
                                        smsNotifications: false,
                                        pushNotifications: true,
                                        weeklyReports: true,
                                        monthlyReports: true,
                                        autoBackup: true,
                                        backupFrequency: 'daily',
                                        dataRetention: '7years',
                                        twoFactorAuth: false
                                    });
                                    alert('Settings have been reset to default values!');
                                }
                            }}
                        >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Reset to Default
                        </button>
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
                            onClick={handleSaveSettings}
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;