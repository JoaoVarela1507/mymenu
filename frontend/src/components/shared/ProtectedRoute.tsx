import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserType } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes: UserType[];
  soft?: boolean;
}

export default function ProtectedRoute({ children, allowedTypes, soft = false }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    if (soft) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-[#660000] mb-2">Acesso restrito</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Faça login ou crie uma conta gratuita para acessar essa funcionalidade.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-[#C92924] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#A02219] transition-colors"
              >
                Fazer Login
              </button>
              <button
                onClick={() => navigate('/cadastro')}
                className="border-2 border-[#C92924] text-[#C92924] font-bold py-3 px-6 rounded-lg hover:bg-red-50 transition-colors"
              >
                Criar Conta Grátis
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 text-sm hover:text-gray-600 transition-colors mt-1"
              >
                Continuar como visitante
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  if (!allowedTypes.includes(user!.type)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
