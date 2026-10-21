export default function Navbar({ currentView, setView, user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => setView(user ? 'dashboard' : 'login')}>
          <div className="brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="brand-title">SecureAuth</span>
        </div>

        <nav className="navbar-links">
          {user ? (
            <div className="navbar-user-section">
              <span className="navbar-greeting">
                Signed in as <strong>{user.fullName}</strong>
              </span>
              <button
                type="button"
                className="nav-btn nav-btn-outline"
                onClick={() => setView('change-password')}
              >
                Change Password
              </button>
              <button
                type="button"
                className="nav-btn nav-btn-outline"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth-buttons">
              <button
                type="button"
                className={`nav-btn ${currentView === 'login' ? 'nav-btn-active' : 'nav-btn-text'}`}
                onClick={() => setView('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`nav-btn ${currentView === 'register' ? 'nav-btn-primary' : 'nav-btn-text'}`}
                onClick={() => setView('register')}
              >
                Sign Up
              </button>
              <button
                type="button"
                className="nav-btn nav-btn-text"
                onClick={() => setView('forgot-password')}
              >
                Forgot Password
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
