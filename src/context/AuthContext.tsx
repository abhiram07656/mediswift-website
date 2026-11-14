import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  addresses: Address[];
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
  toggleDemoRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mediswift_token'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    if (!token) {
      // Auto login default demo user if no token
      try {
        const res = await api.login('user@mediswift.com', 'password123');
        localStorage.setItem('mediswift_token', res.token);
        setToken(res.token);
        setUser(res.user);
        const me = await api.getMe();
        setAddresses(me.addresses);
      } catch (err) {
        console.error('Failed to auto-login demo user:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setAddresses(data.addresses);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('mediswift_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('mediswift_token', res.token);
    setToken(res.token);
    setUser(res.user);
    const me = await api.getMe();
    setAddresses(me.addresses);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.register(name, email, password, phone);
    localStorage.setItem('mediswift_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('mediswift_token');
    setToken(null);
    setUser(null);
    setAddresses([]);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const refreshUserData = async () => {
    if (token) {
      const data = await api.getMe();
      setUser(data.user);
      setAddresses(data.addresses);
    }
  };

  const toggleDemoRole = async () => {
    if (user?.role === 'admin' || user?.role === 'pharmacist') {
      await login('user@mediswift.com', 'password123');
    } else {
      await login('admin@mediswift.com', 'admin123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        addresses,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUserData,
        toggleDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
