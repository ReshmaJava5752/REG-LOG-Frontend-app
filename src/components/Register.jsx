import { useState } from 'react';
import { apiService } from '../services/api';
import {
  PASSWORD_ERROR_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PLACEHOLDER,
  PASSWORD_RULES,
  isPasswordValid,
} from '../constants/passwordPolicy';

export default function Register({ onSwitchToLogin, onSwitchToForgotPassword }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 3 || formData.fullName.trim().length > 100) {
      errs.fullName = 'Full name must be between 3 and 100 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile number is required.';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.trim())) {
      errs.mobileNumber = 'Mobile number must contain exactly 10 digits.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (!isPasswordValid(formData.password)) {
      errs.password = PASSWORD_ERROR_MESSAGE;
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
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
    const response = await apiService.register(formData);
    setLoading(false);

    if (response.success) {
      setAlert({
        type: 'success',
        message: 'Registration successful! You can now log in with your credentials.',
      });
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
      });
      // Automatically redirect to login after a brief pause
      setTimeout(() => {
        onSwitchToLogin();
      }, 1600);
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="19" y1="8" x2="19" y2="14"></line>
            <line x1="22" y1="11" x2="16" y2="11"></line>
          </svg>
        </div>
        <h2>Create an Account</h2>
        <p className="auth-subtitle">Register to get started with your secure account</p>
      </div>

      {alert.message && (
        <div className={`alert-banner alert-${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className={`form-input ${errors.fullName ? 'input-error' : ''}`}
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.fullName && <span className="field-error">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            className={`form-input ${errors.email ? 'input-error' : ''}`}
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number</label>
          <input
            id="mobileNumber"
            name="mobileNumber"
            type="text"
            maxLength="10"
            className={`form-input ${errors.mobileNumber ? 'input-error' : ''}`}
            placeholder="9876543210"
            value={formData.mobileNumber}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.mobileNumber && <span className="field-error">{errors.mobileNumber}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            className={`form-input ${errors.password ? 'input-error' : ''}`}
            placeholder={PASSWORD_PLACEHOLDER}
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          <ul className="password-rules">
            {PASSWORD_RULES.map((rule) => (
              <li
                key={rule.id}
                className={`password-rule ${rule.test(formData.password) ? 'met' : ''}`}
              >
                <span className="password-rule-marker" aria-hidden="true">
                  {rule.test(formData.password) ? '✓' : '•'}
                </span>
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <span className="btn-loading-content">
              <span className="spinner"></span> Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={onSwitchToLogin} disabled={loading}>
            Sign In here
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
