import { useState } from 'react';
import { apiService } from '../services/api';

export default function Login({ onSwitchToRegister, onLoginSuccess, onSwitchToForgotPassword }) {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};

    if (!formData.identifier.trim()) {
      errs.identifier = 'Email or mobile number is required.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!validate()) {
      return;
    }

    setLoading(true);
    const response = await apiService.login({
      identifier: formData.identifier.trim(),
      password: formData.password,
    });
    setLoading(false);

    if (response.success) {
      onLoginSuccess(response.data);
    } else {
      setAlert({
        type: 'error',
        message: response.message,
      });
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to access your secure dashboard</p>
      </div>

      {alert.message && (
        <div className={`alert-banner alert-${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="loginIdentifier">Email or Mobile Number</label>
          <input
            id="loginIdentifier"
            name="identifier"
            type="text"
            className={`form-input ${errors.identifier ? 'input-error' : ''}`}
            placeholder="name@example.com or 9876543210"
            value={formData.identifier}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.identifier && <span className="field-error">{errors.identifier}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            className={`form-input ${errors.password ? 'input-error' : ''}`}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <span className="btn-loading-content">
              <span className="spinner"></span> Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Don't have an account?{' '}
          <button type="button" className="link-button" onClick={onSwitchToRegister} disabled={loading}>
            Create one here
          </button>
        </p>
        {onSwitchToForgotPassword && (
          <p style={{ marginTop: '8px' }}>
            Forgot your password?{' '}
            <button type="button" className="link-button" onClick={onSwitchToForgotPassword} disabled={loading}>
              Reset it here
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
