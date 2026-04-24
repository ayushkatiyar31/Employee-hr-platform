import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './Components/AuthContext';
import { authApi } from './api';
import AdminPortal from './admin/AdminPortal';
import EmployeePortal from './employee/EmployeePortal';
import ProtectedRoute from './Components/ProtectedRoute';
import './hr-platform.css';
import { validatePasswordForSignup } from './validation';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const isSignup = location.pathname === '/register';
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        const passwordError = validatePasswordForSignup(formData.password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        await authApi.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        navigate('/login', {
          replace: true,
          state: { successMessage: 'Account created successfully. Please sign in.' }
        });
        return;
      }

      const response = await authApi.login({ email: formData.email, password: formData.password });
      login(response.data.user, response.data.token);
      navigate(response.data.user.role === 'employee' ? '/employee' : '/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-auth-shell">
      <div className="hr-auth-card">
        <div className="hr-auth-header">
          <div className="hr-auth-mark"><i className="bi bi-buildings-fill"></i></div>
          <h1>{isSignup ? 'Create your EmployeeHR account' : 'Sign in to EmployeeHR'}</h1>
          <p>
            {isSignup
              ? 'New employees can create an account here. Admin accounts are created manually by HR.'
              : 'Admin, HR, and employees sign in with credentials provided by the HR team.'}
          </p>
        </div>

        <form className="hr-auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              <span>Full Name</span>
              <input type="text" name="name" value={formData.name} onChange={updateField} required />
            </label>
          )}
          <label>
            <span>Email</span>
            <input type="email" name="email" value={formData.email} onChange={updateField} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" value={formData.password} onChange={updateField} required />
          </label>

          {isSignup && (
            <label>
              <span>Confirm Password</span>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={updateField} required />
            </label>
          )}

          {error && <div className="hr-auth-error">{error}</div>}
          {!error && location.state?.successMessage ? <div className="hr-auth-success">{location.state.successMessage}</div> : null}

          <button className="hr-primary-button" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>

        {isSignup ? (
          <div className="hr-auth-helper">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        ) : (
          <div className="hr-auth-helper">
            <div><strong>Admin setup:</strong> run <code>node scripts/createAdmin.js</code> in <code>backend</code>, then sign in with <code>admin@company.com / admin123</code>.</div>
            <div style={{ marginTop: '10px' }}>Don't have an account? <Link to="/register">Sign up</Link></div>
          </div>
        )}
      </div>
    </div>
  );
};

const LandingRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="hr-loading-screen">Loading workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'employee' ? '/employee' : '/admin'} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingRedirect />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={['admin', 'hr', 'manager']}>
            <AdminPortal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/*"
        element={
          <ProtectedRoute roles={['employee']}>
            <EmployeePortal />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
