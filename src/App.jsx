import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import VerifyOtp from './components/VerifyOtp';
import ResetPassword from './components/ResetPassword';
import ChangePassword from './components/ChangePassword';
import { apiService } from './services/api';
import './App.css';

export default function App() {
  const [_token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [view, setView] = useState(() => {
    const storedToken = localStorage.getItem('auth_token');
    return storedToken ? 'dashboard' : 'login';
  });

  // Temporary data carried across the password-recovery steps
  const [recovery, setRecovery] = useState({
    identifier: '',
    resetToken: '',
  });

  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'

  // Clear session on unauthenticated (401) responses
  const handleUnauthorized = useCallback(() => {
    apiService.clearSession();
    setToken(null);
    setUser(null);
    setView('login');
    setRecovery({ identifier: '', resetToken: '' });
  }, []);

  // Register global 401 handler with the API service
  useEffect(() => {
    apiService.setUnauthorizedHandler(handleUnauthorized);
  }, [handleUnauthorized]);

  // Check backend server connection on startup
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      const res = await apiService.checkStatus();
      if (isMounted) {
        setBackendStatus(res.success ? 'connected' : 'offline');
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Validate authentication token on application startup.
  // If the stored token is expired or revoked, the backend /profile endpoint
  // returns 401; in that case clear the session and redirect to login.
  useEffect(() => {
    let isMounted = true;
    const validateStartupAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        return;
      }
      try {
        const response = await apiService.getProfile();
        if (!isMounted) return;
        if (response.success && response.data) {
          setToken(storedToken);
          apiService.setUser(response.data);
          setUser(response.data);
          setView('dashboard');
        } else {
          apiService.clearSession();
          setToken(null);
          setUser(null);
          setView('login');
        }
      } catch {
        apiService.clearSession();
        setToken(null);
        setUser(null);
        setView('login');
      }
    };
    validateStartupAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = (authResponse) => {
    // authResponse = { token, tokenType, user }
    if (authResponse.token) {
      apiService.setToken(authResponse.token);
      setToken(authResponse.token);
    }
    if (authResponse.user) {
      apiService.setUser(authResponse.user);
      setUser(authResponse.user);
    }
    setView('dashboard');
    setRecovery({ identifier: '', resetToken: '' });
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch {
      // Ignore network errors on logout
    }
    apiService.clearSession();
    setToken(null);
    setUser(null);
    setView('login');
    setRecovery({ identifier: '', resetToken: '' });
  };

  // ----- Password recovery flow -----
  const handleForgotPasswordSuccess = (identifier) => {
    setRecovery((prev) => ({ ...prev, identifier }));
    setView('verify-otp');
  };

  const handleVerifyOtpSuccess = (resetToken) => {
    setRecovery((prev) => ({ ...prev, resetToken }));
    setView('reset-password');
  };

  const handleResetPasswordSuccess = () => {
    setRecovery({ identifier: '', resetToken: '' });
    setView('login');
  };

  const handleChangePasswordSuccess = () => {
    // Password change revokes all active tokens; force re-login
    apiService.clearSession();
    setToken(null);
    setUser(null);
    setView('login');
    setRecovery({ identifier: '', resetToken: '' });
  };

  return (
    <div className="app-layout">
      <Navbar
        currentView={view}
        setView={setView}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {/* Backend Connectivity Status Ribbon */}
        {backendStatus === 'offline' && (
          <div className="status-banner offline">
            <span>
              <strong>Backend Disconnected:</strong> Spring Boot is not detected on port 8080.
              Please ensure the Spring Boot server is started and your MySQL password is set.
            </span>
          </div>
        )}

        {/* Views */}
        {view === 'dashboard' && (
          <Dashboard user={user} onLogout={handleLogout} onUnauthorized={handleUnauthorized} />
        )}

        {view === 'login' && (
          <Login
            onSwitchToRegister={() => setView('register')}
            onSwitchToForgotPassword={() => setView('forgot-password')}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {view === 'register' && (
          <Register
            onSwitchToLogin={() => setView('login')}
            onSwitchToForgotPassword={() => setView('forgot-password')}
          />
        )}

        {view === 'forgot-password' && (
          <ForgotPassword
            onSwitchToLogin={() => setView('login')}
            onForgotPasswordSuccess={handleForgotPasswordSuccess}
          />
        )}

        {view === 'verify-otp' && (
          <VerifyOtp
            identifier={recovery.identifier}
            onVerifyOtpSuccess={handleVerifyOtpSuccess}
            onSwitchToForgotPassword={() => setView('forgot-password')}
            onSwitchToLogin={() => setView('login')}
          />
        )}

        {view === 'reset-password' && (
          <ResetPassword
            identifier={recovery.identifier}
            resetToken={recovery.resetToken}
            onResetPasswordSuccess={handleResetPasswordSuccess}
            onSwitchToLogin={() => setView('login')}
          />
        )}

        {view === 'change-password' && (
          <ChangePassword
            user={user}
            onChangePasswordSuccess={handleChangePasswordSuccess}
            onUnauthorized={handleUnauthorized}
            onBackToDashboard={() => setView('dashboard')}
          />
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>Registration & Login System &bull; Spring Boot + React + MySQL</p>
          <div className="backend-indicator">
            <span className={`status-dot ${backendStatus}`}></span>
            <span>
              Backend: {backendStatus === 'connected' ? 'Connected (Port 8080)' : backendStatus === 'offline' ? 'Offline' : 'Checking...'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
