import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token on app start
    if (token) {
      // Verify token is still valid by calling a protected endpoint
      api.get('/user')
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error('Token validation failed', error);
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, authToken) => {
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    // Call logout endpoint to revoke token on server side
    api.post('/logout')
      .catch(error => console.error('Logout API call failed', error))
      .finally(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      });
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};