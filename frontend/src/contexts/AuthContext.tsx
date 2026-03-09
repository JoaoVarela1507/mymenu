import { createContext, useContext, useState, ReactNode } from 'react';
import type { AuthUser, LoginCredentials } from '../types/auth';
import { mockLogin } from '../lib/mockAuth';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('mymenu_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    const authenticatedUser = mockLogin(credentials.email, credentials.password);
    
    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem('mymenu_user', JSON.stringify(authenticatedUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mymenu_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
