import React, { useState, useMemo, useEffect } from 'react';
import '../profileSetup.css';

const ParticlesBackground = () => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
            overflow: 'hidden'
        }}>
            {[...Array(100)].map((_, i) => {
                const colors = ['#ffffff', '#667eea', '#10b981', '#f59e0b', '#a855f7', '#06b6d4', '#ef4444', '#fbbf24'];
                const color = colors[i % colors.length];
                const size = 2 + (i % 6);
                const left = (i * 7.3) % 100;
                const delay = -((i * 0.1) % 10);
                const duration = 5 + (i % 8);
                
                return (
                    <div 
                        key={i}
                        style={{
                            position: 'absolute',
                            width: size + 'px',
                            height: size + 'px',
                            background: color,
                            borderRadius: '50%',
                            left: left + '%',
                            boxShadow: `0 0 ${size * 2}px ${color}`,
                            animation: `floatUp ${duration}s ${delay}s infinite linear`
                        }}
                    ></div>
                );
            })}
        </div>
    );
};

const ProfileSetup = ({ onComplete }) => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        role: 'hr'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const userData = {
            id: Date.now(),
            name: formData.name,
            company: formData.company,
            role: formData.role,
            email: `${formData.name.toLowerCase().replace(' ', '.')}@${formData.company.toLowerCase()}.com`
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'demo-token-' + Date.now());
        
        onComplete(userData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="auth-container" style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #404040 50%, #2a2a2a 75%, #1f1f1f 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <ParticlesBackground />
            <div className="auth-card" style={{
                position: 'relative', 
                zIndex: 2,
                background: 'linear-gradient(135deg, rgba(254, 215, 170, 0.8) 0%, rgba(254, 240, 138, 0.8) 50%, rgba(252, 165, 165, 0.8) 100%)',
                border: '2px solid rgba(251, 146, 60, 0.5)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                color: '#000000'
            }}>
                <div className="auth-header">
                    <div className="auth-logo" style={{animation: 'rotate 6s linear infinite'}}>
                        🏢
                    </div>
                    <h1 className="auth-title" style={{color: '#000000'}}>Welcome to HR Platform</h1>
                    <p className="auth-subtitle" style={{color: '#000000'}}>Set up your profile to get started</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name" style={{color: '#000000', fontWeight: 'bold'}}><i className="bi bi-person-fill me-2"></i>Your Name</label>
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
                        <label htmlFor="company" style={{color: '#000000', fontWeight: 'bold'}}><i className="bi bi-building-fill me-2"></i>Company Name</label>
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
                        <label htmlFor="role" style={{color: '#000000', fontWeight: 'bold'}}><i className="bi bi-briefcase-fill me-2"></i>Your Role</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="hr">HR Manager</option>
                            <option value="manager">Department Manager</option>
                            <option value="admin">System Administrator</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        style={{
                            background: 'linear-gradient(135deg, #701a75 0%, #86198f 20%, #a21caf 40%, #be185d 60%, #db2777 80%, #ec4899 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 3px 10px rgba(168, 85, 247, 0.3)',
                            opacity: (!formData.name || !formData.company) ? 0.6 : 1,
                            width: '100%',
                            fontSize: '14px'
                        }}
                        onMouseEnter={(e) => {
                            if (formData.name && formData.company) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(168, 85, 247, 0.3)';
                        }}
                        disabled={!formData.name || !formData.company}
                    >
                        Get Started
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
