import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { AuthUser, LoginCredentials } from '../types/auth';
import { apiLoginWithProfile, apiLogout, onAuthChanged, checkAvailableProfiles, loginWithGoogle as loginWithGoogleService } from '../services/authService';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';


interface LoginResult {
  success: boolean;
  needsProfileChoice?: boolean;
  email?: string;
  password?: string;
}

interface LoginGoogleResult {
  success: boolean;
  needsProfileChoice?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  loginWithProfile: (profile: 'consumer' | 'admin') => Promise<boolean>;
  loginWithGoogle: () => Promise<LoginGoogleResult>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  hasMultipleProfiles: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMultipleProfiles, setHasMultipleProfiles] = useState(false);
  // Bloqueia o onAuthChanged de setar user automaticamente durante login manual
  const suppressAuthChange = useRef(false);

  useEffect(() => {
    if (!user?.id) { setHasMultipleProfiles(false); return; }
    checkAvailableProfiles(user.id).then(p => setHasMultipleProfiles(p.length > 1));
  }, [user?.id]);

  useEffect(() => {
    const unsubscribe = onAuthChanged((firebaseUser) => {
      if (suppressAuthChange.current) return;
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      suppressAuthChange.current = true;

      const { user: fbUser } = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const profiles = await checkAvailableProfiles(fbUser.uid);

      if (profiles.length > 1) {
        // Tem dois perfis — devolve para o Login.tsx mostrar o modal
        suppressAuthChange.current = false;
        return { success: true, needsProfileChoice: true, email: credentials.email, password: credentials.password };
      }

      // Só um perfil — entra direto
      const authUser = await apiLoginWithProfile('', '', profiles[0]);
      suppressAuthChange.current = false;
      if (authUser) {
        setUser(authUser);
        setLoading(false);
        return { success: true };
      }
      return { success: false };
    } catch {
      suppressAuthChange.current = false;
      return { success: false };
    }
  };

  const loginWithProfile = async (profile: 'consumer' | 'admin'): Promise<boolean> => {
    const authUser = await apiLoginWithProfile('', '', profile);
    if (authUser) {
      setUser(authUser);
      setLoading(false);
      return true;
    }
    return false;
  };

  const loginWithGoogle = async (): Promise<LoginGoogleResult> => {
    try {
      suppressAuthChange.current = true;
      const result = await loginWithGoogleService();
      suppressAuthChange.current = false;

      if (result === null) return { success: false };
      if (result === 'choose_profile') return { success: true, needsProfileChoice: true };

      setUser(result);
      setLoading(false);
      return { success: true };
    } catch {
      suppressAuthChange.current = false;
      return { success: false };
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-[#C92924] font-bold">Carregando...</span>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithProfile, loginWithGoogle, isAuthenticated: !!user, loading, hasMultipleProfiles }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
