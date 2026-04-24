import React, { useState } from 'react';
import { notify } from '../utils';
import { useAuth } from './AuthContext';
import { getPasswordChecks } from '../validation';
import '../auth.css';

const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

        if (!formData.email.trim()) {
            nextErrors.email = 'Email is required';
        }

        if (!formData.password.trim()) {
            nextErrors.password = 'Password is required';
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
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
                notify('Login successful!', 'success');
            } else {
                const apiError = data.errors?.[0]?.msg || data.message || 'Login failed';
                setErrors({ password: apiError });
                notify(data.message || 'Login failed', 'error');
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
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
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
                        <div className="password-hint">
                            <span>Password guidance</span>
                            <span>{passwordChecks.filter((item) => item.passed).length}/5 checks</span>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-link">
                    Don't have an account? 
                    <button 
                        type="button" 
                        className="link-button" 
                        onClick={() => window.showSignup && window.showSignup()}
                    >
                        Sign up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
