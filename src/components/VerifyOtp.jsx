import { useState } from 'react';
import { apiService } from '../services/api';

export default function VerifyOtp({ identifier, onVerifyOtpSuccess, onSwitchToForgotPassword, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    otpCode: '',
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.otpCode.trim()) {
      errs.otpCode = 'OTP code is required.';
    } else if (!/^[0-9]{6}$/.test(formData.otpCode.trim())) {
      errs.otpCode = 'OTP code must be exactly 6 digits.';
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
    const response = await apiService.verifyOtp(identifier, formData.otpCode.trim());
    setLoading(false);

    if (response.success) {
      // Backend returns resetToken inside response.data
      const resetToken = response.data?.resetToken || null;
      if (resetToken) {
        onVerifyOtpSuccess(resetToken);
      } else {
        setAlert({
          type: 'error',
          message: 'Reset token not received from server.',
        });
      }
    } else {
      if (response.status === 401) {
        setAlert({ type: 'error', message: 'Session expired. Please request a new OTP.' });
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
            <polyline points="12 6 12 12 16 14"></polyline>
            <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9a9 9 0 0 1 9-9a9 9 0 0 1 9 9z"></path>
          </svg>
        </div>
        <h2>Verify OTP</h2>
        <p className="auth-subtitle">
          Enter the 6-digit code for <strong>{identifier}</strong>
        </p>
      </div>

      {alert.message && (
        <div className={`alert-banner alert-${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="otpCode">OTP Code</label>
          <input
            id="otpCode"
            name="otpCode"
            type="text"
            maxLength="6"
            className={`form-input ${errors.otpCode ? 'input-error' : ''}`}
            placeholder="123456"
            value={formData.otpCode}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.otpCode && <span className="field-error">{errors.otpCode}</span>}
        </div>

        <p className="auth-subtitle" style={{ fontSize: '0.82rem', marginTop: '6px', color: '#64748b' }}>
          The code is sent by <strong>e-mail</strong> to the e-mail address on your account, even
          when you signed in with your mobile number. It is valid for 5 minutes and allows 3
          incorrect attempts.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-loading-content">
                <span className="spinner"></span> Verifying...
              </span>
            ) : (
              'Verify OTP'
            )}
          </button>
          <button
            type="button"
            className="nav-btn-outline"
            onClick={onSwitchToForgotPassword}
            disabled={loading}
          >
            Request New OTP
          </button>
        </div>
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
