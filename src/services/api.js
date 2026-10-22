// Centralized API service for communicating with the Spring Boot backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

let onUnauthorizedHandler = null;

/**
 * Helper to handle fetch requests and standardize responses
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    // Global HTTP 401 handling: token expired or revoked — clear session and notify app
    if (response.status === 401) {
      clearSession();
      if (onUnauthorizedHandler) {
        onUnauthorizedHandler();
      }
      return {
        success: false,
        status: 401,
        message: 'Authentication expired or invalid. Please log in again.',
        errors: null,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data?.message || `Request failed with status ${response.status}`,
        errors: data?.data || null,
      };
    }

    return {
      success: true,
      status: response.status,
      message: data?.message || 'Success',
      data: data?.data || null,
    };
  } catch {
    return {
      success: false,
      message: 'Unable to connect to the backend server. Please verify Spring Boot is running on port 8080.',
      errors: null,
    };
  }
}

export const apiService = {
  // Register a new user
  register: (userData) => {
    return request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login authentication (accepts email or 10-digit mobile number as identifier)
  login: (credentials) => {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Logout (revokes current JWT token)
  logout: () => {
    return request('/logout', {
      method: 'POST',
    });
  },

  // Check backend server status
  checkStatus: () => {
    return request('/status', {
      method: 'GET',
    });
  },

  // Get user profile (Bearer-authenticated)
  getProfile: () => {
    return request('/profile', {
      method: 'GET',
    });
  },

  // Forgot password - request 6-digit OTP (identifier = email or mobile)
  forgotPassword: (identifier) => {
    return request('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  // Verify OTP code and obtain single-use reset token
  verifyOtp: (identifier, otpCode) => {
    return request('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otpCode }),
    });
  },

  // Reset password using verified reset token
  resetPassword: (identifier, resetToken, newPassword, confirmPassword) => {
    return request('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, resetToken, newPassword, confirmPassword }),
    });
  },

  // Change password for authenticated user (Bearer required)
  changePassword: (currentPassword, newPassword, confirmPassword) => {
    return request('/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  },

  // ----- Token / session helpers -----
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  setUnauthorizedHandler: (handler) => {
    onUnauthorizedHandler = handler;
  },
};
