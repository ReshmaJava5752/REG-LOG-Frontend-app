import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function Dashboard({ user, onLogout, onUnauthorized }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileUser, setProfileUser] = useState(user);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    await onLogout();
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const response = await apiService.getProfile();
        if (!isMounted) return;
        if (response.success && response.data) {
          setProfileUser(response.data);
          setProfileError(null);
        } else if (response.status === 401) {
          // Token expired or revoked by the backend; clear session and redirect.
          setProfileError('unauthorized');
          if (onUnauthorized) {
            onUnauthorized();
          }
        } else {
          setProfileError(response.message || 'Failed to load profile.');
        }
      } catch {
        setProfileError('Unable to connect to the backend.');
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [onUnauthorized]);

  const displayUser = profileUser || user;

  if (loadingProfile) {
    return (
      <div className="auth-card" style={{ maxWidth: '440px', margin: '40px auto' }}>
        <div className="auth-header" style={{ textAlign: 'center' }}>
          <span className="spinner"></span>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '12px', marginBottom: 0 }}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (profileError === 'unauthorized') {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Header Card */}
      <div className="dashboard-header-card">
        <div className="dashboard-welcome">
          <div className="user-avatar">
            {displayUser?.fullName ? displayUser.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1>Welcome, {displayUser?.fullName || 'User'}!</h1>
            <p className="dashboard-subtitle">
              You are securely logged into your protected user dashboard.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn-logout"
          disabled={loggingOut}
        >
          {loggingOut ? (
            <span className="btn-loading-content">
              <span className="spinner"></span> Logging out...
            </span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Information Cards */}
      <div className="dashboard-grid">
        {/* Profile Details Card */}
        <div className="dash-card">
          <div className="card-header">
            <div className="card-icon blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3>Account Profile</h3>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">User ID</span>
              <span className="info-value">#{displayUser?.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Full Name</span>
              <span className="info-value">{displayUser?.fullName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email Address</span>
              <span className="info-value">{displayUser?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member Since</span>
              <span className="info-value">{formatDate(displayUser?.createdAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Updated</span>
              <span className="info-value">{formatDate(displayUser?.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Security & System Status Card */}
        <div className="dash-card">
          <div className="card-header">
            <div className="card-icon green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Security & Stack</h3>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Password Protection</span>
              <span className="badge-pill badge-green">BCrypt Hash (Salted)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Database Storage</span>
              <span className="badge-pill badge-blue">MySQL (registration_db)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Backend Engine</span>
              <span className="badge-pill badge-purple">Spring Boot 3.4.2</span>
            </div>
            <div className="info-row">
              <span className="info-label">Session Status</span>
              <span className="badge-pill badge-active">Protected & Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
