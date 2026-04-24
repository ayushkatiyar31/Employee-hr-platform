import React, { useState } from 'react';
import { notify } from '../utils';
import { useAuth } from './AuthContext';
import { getPasswordChecks, validatePasswordForSignup } from '../validation';
import '../auth.css';

const Signup = ({ onSwitchToLogin }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const passwordChecks = getPasswordChecks(formData.password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nextErrors = {};
        const passwordError = validatePasswordForSignup(formData.password);

        if (!formData.name.trim()) {
            nextErrors.name = 'Full name is required';
        }

        if (!formData.email.trim()) {
            nextErrors.email = 'Email is required';
        }

        if (passwordError) {
            nextErrors.password = passwordError;
        }

        if (formData.password !== formData.confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            notify('Please fix the highlighted fields', 'error');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                const userData = {
                    id: data.data.user.id,
                    name: data.data.user.name,
                    email: data.data.user.email,
                    role: data.data.user.role
                };
                
                login(userData, data.data.token);
                notify('Account created successfully!', 'success');
            } else {
                const apiError = data.errors?.[0]?.msg || data.message || 'Registration failed';
                setErrors({ password: apiError });
                notify(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            notify('Cannot connect to server. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <i className="bi bi-building"></i>
                    </div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join our employee management system</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            className={errors.name ? 'input-error' : ''}
                        />
                        {errors.name && <p className="field-error">{errors.name}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            className={errors.email ? 'input-error' : ''}
                        />
                        {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            className={errors.password ? 'input-error' : ''}
                        />
                        {errors.password && <p className="field-error">{errors.password}</p>}
                        <div className="password-checklist">
                            {passwordChecks.map((item) => (
                                <div key={item.label} className={`password-check ${item.passed ? 'passed' : ''}`}>
                                    <span>{item.passed ? 'OK' : 'NO'}</span>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                            className={errors.confirmPassword ? 'input-error' : ''}
                        />
                        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-link">
                    Already have an account? 
                    <button 
                        type="button" 
                        className="link-button" 
                        onClick={onSwitchToLogin}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Signup;
