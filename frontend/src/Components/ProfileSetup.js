import React, { useState } from 'react';
import '../profileSetup.css';

const ParticlesBackground = () => {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                overflow: 'hidden'
            }}
        >
            {[...Array(80)].map((_, index) => {
                const colors = ['#ffffff', '#38bdf8', '#2dd4bf', '#f59e0b'];
                const color = colors[index % colors.length];
                const size = 2 + (index % 5);
                const left = (index * 8.7) % 100;
                const duration = 6 + (index % 7);

                return (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            width: size,
                            height: size,
                            borderRadius: '50%',
                            left: `${left}%`,
                            background: color,
                            boxShadow: `0 0 ${size * 2}px ${color}`,
                            animation: `floatUp ${duration}s ${-index * 0.1}s infinite linear`
                        }}
                    />
                );
            })}
        </div>
    );
};

const roleCards = {
    employee: {
        title: 'Employee Portal',
        description: 'Apply for leave, track approvals, and manage only your own workspace details.'
    },
    hr: {
        title: 'HR Workspace',
        description: 'Manage employees, leave approvals, departments, and day-to-day people operations.'
    },
    manager: {
        title: 'Manager Workspace',
        description: 'Use the same admin side with team-oriented management and reporting access.'
    },
    admin: {
        title: 'Admin Workspace',
        description: 'Operate like HR with the full management side for employees, leave, and reports.'
    }
};

const ProfileSetup = ({ onComplete }) => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        role: 'employee'
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const safeName = formData.name.trim();
        const safeCompany = formData.company.trim();

        const userData = {
            id: Date.now(),
            name: safeName,
            company: safeCompany,
            role: formData.role,
            email: `${safeName.toLowerCase().replace(/\s+/g, '.') }@${safeCompany.toLowerCase().replace(/\s+/g, '')}.com`
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', `demo-token-${Date.now()}`);

        onComplete(userData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div
            className="auth-container"
            style={{
                background: 'linear-gradient(135deg, #082f49 0%, #0f172a 42%, #0f766e 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <ParticlesBackground />
            <div
                className="auth-card"
                style={{
                    position: 'relative',
                    zIndex: 2,
                    background: 'rgba(248, 250, 252, 0.94)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.3)',
                    color: '#000000',
                    maxWidth: '520px'
                }}
            >
                <div className="auth-header">
                    <div className="auth-logo" style={{ animation: 'rotate 6s linear infinite' }}>
                        <i className="bi bi-buildings-fill"></i>
                    </div>
                    <h1 className="auth-title" style={{ color: '#000000' }}>Choose Your Workspace</h1>
                    <p className="auth-subtitle" style={{ color: '#334155' }}>
                        Admin and HR users get the management side. Employees get a focused self-service portal.
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name" style={{ color: '#000000', fontWeight: 'bold' }}>
                            <i className="bi bi-person-fill me-2"></i>Your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="company" style={{ color: '#000000', fontWeight: 'bold' }}>
                            <i className="bi bi-building-fill me-2"></i>Company Name
                        </label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Enter your company name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role" style={{ color: '#000000', fontWeight: 'bold' }}>
                            <i className="bi bi-briefcase-fill me-2"></i>Your Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="employee">Employee</option>
                            <option value="hr">HR Manager</option>
                            <option value="manager">Department Manager</option>
                            <option value="admin">System Administrator</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gap: '10px', marginBottom: '18px' }}>
                        {Object.entries(roleCards).map(([key, card]) => (
                            <div
                                key={key}
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: '14px',
                                    background: formData.role === key ? (key === 'employee' ? '#dbeafe' : '#ccfbf1') : '#f8fafc',
                                    border: '1px solid #cbd5e1'
                                }}
                            >
                                <div style={{ fontWeight: '800', color: '#0f172a' }}>{card.title}</div>
                                <div style={{ color: '#475569', fontSize: '0.86rem', marginTop: '4px' }}>{card.description}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 40%, #1d4ed8 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 8px 24px rgba(15, 118, 110, 0.3)',
                            opacity: (!formData.name.trim() || !formData.company.trim()) ? 0.6 : 1,
                            width: '100%',
                            fontSize: '15px'
                        }}
                        disabled={!formData.name.trim() || !formData.company.trim()}
                    >
                        Enter Workspace
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
