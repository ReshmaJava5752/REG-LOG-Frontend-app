import { useState } from 'react';
import { apiService } from '../services/api';

export default function ForgotPassword({ onSwitchToLogin, onForgotPasswordSuccess }) {
  const [formData, setFormData] = useState({
    identifier: '',
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.identifier.trim()) {
      errs.identifier = 'Email or mobile number is required.';
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
    const response = await apiService.forgotPassword(formData.identifier.trim());
    setLoading(false);

    if (response.success) {
      onForgotPasswordSuccess(formData.identifier.trim());
    } else {
      // 401 should not happen on public forgot-password; treat as generic error
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
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </div>
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email or mobile number to request a reset OTP</p>
      </div>

      {alert.message && (
        <div className={`alert-banner alert-${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="identifier">Email or Mobile Number</label>
          <input
            id="identifier"
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

        <p className="auth-subtitle" style={{ fontSize: '0.82rem', marginTop: '6px', color: '#64748b' }}>
          A 6-digit OTP will be generated and sent to the e-mail address on your account. It is
          valid for 5 minutes. The code is always delivered by e-mail - this application does
          not send SMS messages.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-loading-content">
                <span className="spinner"></span> Sending OTP...
              </span>
            ) : (
              'Send OTP'
            )}
          </button>
          <button
            type="button"
            className="nav-btn-outline"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Back to Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
