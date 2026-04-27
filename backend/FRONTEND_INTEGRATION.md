"""
Frontend Integration Guide

## How to Use the Backend in Your React Frontend

### 1. Configure API Base URL

In your frontend environment (.env or vite.config.ts):
```
VITE_API_URL=http://localhost:8000
```

### 2. Create API Client

Create a file `src/services/backendApi.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const authService = {
  async register(email: string, password: string, name: string, role: 'consumer' | 'admin') {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, role }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    // Store token
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_id', data.user_id);
    
    return data;
  },

  async forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Password reset failed');
    }
    
    return response.json();
  },

  getAuthToken() {
    return localStorage.getItem('access_token');
  },

  getUserRole() {
    return localStorage.getItem('user_role');
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
  }
};
```

### 3. Update Your AuthContext

Replace your mockAuth.ts with calls to backendApi:

```typescript
import { authService } from '../services/backendApi';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getAuthToken();
    if (token) {
      // Verify token and set user
      setUser({
        id: localStorage.getItem('user_id') || '',
        email: '',
        name: '',
        role: (authService.getUserRole() as 'consumer' | 'admin') || 'consumer',
      });
    }
    setLoading(false);
  }, []);

  const register = async (email: string, password: string, name: string, role: 'consumer' | 'admin') => {
    await authService.register(email, password, name, role);
  };

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser({
      id: data.user_id,
      email: data.email,
      name: data.name,
      role: data.role,
    });
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    return authService.forgotPassword(email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4. Use in Components

#### Sign Up Component
```typescript
import { useAuth } from '../hooks/useAuth';

export function SignupConsumer() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name, 'consumer');
      // Redirect to login
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your form JSX
  );
}
```

#### Login Component
```typescript
export function Login() {
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    try {
      await login(email, password);
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    // Your form JSX
  );
}
```

#### Password Reset Flow
```typescript
export function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const handleForgot = async (email: string) => {
    try {
      await forgotPassword(email);
      setMessage('Check your email for reset link');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    // Your form JSX
  );
}

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const [token] = useSearchParams().get('token');

  const handleReset = async (newPassword: string) => {
    try {
      await authService.resetPassword(token, newPassword);
      setMessage('Password reset successfully');
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    // Your form JSX
  );
}
```

### 5. CORS Configuration

The backend is already configured with CORS for:
- http://localhost:3000 (Create React App)
- http://localhost:5173 (Vite)

If you need to add more origins, modify [app/main.py](../app/main.py)

### 6. Authentication Headers

When making requests to protected endpoints (future additions), use:
```typescript
const response = await fetch(`${API_URL}/protected-route`, {
  headers: {
    'Authorization': `Bearer ${authService.getAuthToken()}`,
  },
});
```

## Troubleshooting

### CORS Errors
- Ensure backend is running on http://localhost:8000
- Check frontend is on localhost:5173 or 3000
- Backend CORS settings allow your frontend origin

### Token Issues
- Tokens expire after 30 minutes (configurable in .env)
- Implement token refresh logic for long sessions
- Clear localStorage on logout

### Email Issues
- Configure SMTP settings in .env for password reset emails
- Test with: `curl http://localhost:8000/health`
"""
