import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser, LoginCredentials } from '../types/auth';
import { apiLogin, apiLogout, onAuthChanged } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    const authenticatedUser = await apiLogin(credentials.email, credentials.password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-[#C92924] font-bold">Carregando...</span></div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
