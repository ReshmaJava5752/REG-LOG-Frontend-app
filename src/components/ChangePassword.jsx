import { useState } from 'react';
import { apiService } from '../services/api';
import {
  PASSWORD_ERROR_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PLACEHOLDER,
  isPasswordValid,
} from '../constants/passwordPolicy';

export default function ChangePassword({ user, onChangePasswordSuccess, onUnauthorized, onBackToDashboard }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.currentPassword) {
      errs.currentPassword = 'Current password is required.';
    }

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
    const response = await apiService.changePassword(
      formData.currentPassword,
      formData.newPassword,
      formData.confirmPassword
    );
    setLoading(false);

    if (response.success) {
      onChangePasswordSuccess();
    } else {
      if (response.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        }
        setAlert({ type: 'error', message: 'Authentication required. Please log in again.' });
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
            <path d="M7 7h10v10H7z"></path>
          </svg>
        </div>
        <h2>Change Password</h2>
        <p className="auth-subtitle">Update password for <strong>{user?.fullName}</strong> ({user?.email})</p>
      </div>

      {alert.message && (
        <div className={`alert-banner alert-${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            className={`form-input ${errors.currentPassword ? 'input-error' : ''}`}
            placeholder="Enter your current password"
            value={formData.currentPassword}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.currentPassword && <span className="field-error">{errors.currentPassword}</span>}
        </div>

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
              <span className="spinner"></span> Changing Password...
            </span>
          ) : (
            'Change Password'
          )}
        </button>
      </form>

      <div className="auth-footer" style={{ marginTop: '16px' }}>
        <p>
          <button
            type="button"
            className="link-button"
            onClick={onBackToDashboard ? onBackToDashboard : () => {}}
            disabled={loading}
          >
            Back to Dashboard
          </button>
        </p>
      </div>
    </div>
  );
}
