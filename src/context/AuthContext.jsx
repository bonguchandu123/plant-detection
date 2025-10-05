import React, { createContext, useState, useContext, useEffect } from 'react';

// API Configuration
const API_BASE = 'http://localhost:8000';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          // Verify token is still valid
          await verifyToken(token);
        } catch (error) {
          console.error('Error initializing auth:', error);
          clearAuth();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Verify token validity by calling /auth/me
  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();
      // Update user data with fresh info
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  // Login function
  const login = async (identifier, password) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: identifier,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.detail || 'Login failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = 'Connection error. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Register/Signup function
  const register = async (userData) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.detail || 'Registration failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = 'Connection error. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Logout function
  const logout = () => {
    clearAuth();
    setError(null);
  };

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('access_token');
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Reset password request
  const resetPassword = async (identifier) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: identifier
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        const errorMsg = data.detail || 'Reset password failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMsg = 'Connection error. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Refresh current user data
  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      return { success: false, error: 'No authentication token' };
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          return { success: true, user: data.user, progress: data.progress };
        }
      } else {
        clearAuth();
        return { success: false, error: 'Session expired' };
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      return { success: false, error: 'Connection error' };
    }
  };

  // Fetch API with automatic authentication
  const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();
    
    if (!token) {
      clearAuth();
      throw new Error('No authentication token');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });

    // Handle unauthorized responses
    if (response.status === 401) {
      clearAuth();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!getToken();
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    hasRole,
    login,
    register,
    logout,
    getToken,
    updateUser,
    resetPassword,
    refreshUser,
    fetchWithAuth,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Export context for direct access if needed
export { AuthContext };
export default AuthProvider