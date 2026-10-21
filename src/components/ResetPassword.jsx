import { useState } from 'react';
import { apiService } from '../services/api';
import {
  PASSWORD_ERROR_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PLACEHOLDER,
  isPasswordValid,
} from '../constants/passwordPolicy';

export default function ResetPassword({ identifier, resetToken, onResetPasswordSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (!isPasswordValid(formData.newPassword)) {
      errs.newPassword = PASSWORD_ERROR_MESSAGE;
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm password is required.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
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
    const response = await apiService.resetPassword(
      identifier,
      resetToken,
      formData.newPassword,
      formData.confirmPassword
    );
    setLoading(false);

    if (response.success) {
      onResetPasswordSuccess();
    } else {
      if (response.status === 401) {
        setAlert({ type: 'error', message: 'Reset session expired or invalid. Please start over.' });
      } else {
        setAlert({
          type: 'error',
          message: response.message,
        });
      }
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v18H3z"></path>
            <path d="M9 9h6v6H9z"></path>
          </svg>
        </div>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Set a new password for <strong>{identifier}</strong></p>
      </div>

      {alert.message && (
        <div className={`alert-banner alert-${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
            placeholder={PASSWORD_PLACEHOLDER}
            value={formData.newPassword}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="Re-enter your new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <span className="btn-loading-content">
              <span className="spinner"></span> Resetting Password...
            </span>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="auth-footer" style={{ marginTop: '16px' }}>
        <p>
          Remember your password?{' '}
          <button type="button" className="link-button" onClick={onSwitchToLogin} disabled={loading}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
