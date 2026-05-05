import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loginWithGoogle } from '../../services/authService';
import { Input, Button, ImageCarousel } from '../../components/shared';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileModal, setProfileModal] = useState<{ email: string; password: string } | null>(null);
  const { login, loginWithProfile, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email, password });

    if (result.success && result.needsProfileChoice) {
      setProfileModal({ email, password });
    } else if (result.success) {
      navigate('/');
    } else {
      setError('Email ou senha inválidos');
    }

    setLoading(false);
  };

  const handleSelectProfile = async (profile: 'consumer' | 'admin') => {
    if (!profileModal) return;
    setLoading(true);
    const ok = await loginWithProfile(profileModal.email, profileModal.password, profile);
    if (ok) {
      navigate('/');
    } else {
      setError('Erro ao entrar. Tente novamente.');
      setProfileModal(null);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const googleUser = await loginWithGoogle();
    if (googleUser) {
      navigate('/');
    } else {
      setError('Erro ao entrar com Google. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex">

      {/* Modal de seleção de perfil */}
      {profileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 border-2 border-[#D4AF37]">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">👤</div>
              <h2 className="text-lg font-bold text-[#C92924]">Com qual perfil deseja entrar?</h2>
              <p className="text-xs text-gray-500 mt-1">Sua conta possui dois perfis cadastrados</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleSelectProfile('consumer')}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#C92924] hover:bg-red-50 transition-all text-left"
              >
                <span className="text-3xl">🛒</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Consumidor</p>
                  <p className="text-xs text-gray-500">Explorar restaurantes e fazer pedidos</p>
                </div>
              </button>
              <button
                onClick={() => handleSelectProfile('admin')}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#C92924] hover:bg-red-50 transition-all text-left"
              >
                <span className="text-3xl">🏪</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Meu Restaurante</p>
                  <p className="text-xs text-gray-500">Gerenciar cardápio, pedidos e configurações</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setProfileModal(null)}
              className="w-full mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {/* Coluna esquerda - Carrossel (55%) */}
      <div className="hidden lg:flex lg:w-7/12 relative">
        <ImageCarousel />
      </div>

      {/* Coluna direita - Formulário de Login (45%) */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto relative z-10">
        <Link to="/" className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 rounded-full bg-[#C92924] hover:bg-[#a81f1a] shadow-md transition-colors z-10" title="Voltar à home">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        {/* Card com Glassmorfismo - Centralizado */}
        <div className="glass-card-golden w-full max-w-lg shadow-2xl">
        <div className="text-center mb-2">
          <div className="-mt-2 mb-2 flex justify-center items-center">
            <img 
              src="/assets/logo.png" 
              alt="MyMenu Logo" 
              className="w-72 h-auto object-contain object-center sharp-image"
            />
          </div>
          <h1 className="text-xl font-bold text-[#C92924] mb-0.5">Bem-vindo</h1>
          <p className="text-[#C92924] font-medium text-xs">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-1">
          <div className="space-y-1">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="px-3 py-1.5 text-sm"
              required
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="px-3 py-1.5 text-sm"
              required
            />
            <div className="flex justify-end mt-1">
              <Link to="/recuperar-senha" className="text-[#C92924]/70 text-xs hover:text-[#C92924]">
                Esqueci minha senha
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-100/80 border border-red-300 rounded-lg p-1.5">
              <p className="text-red-700 text-xs font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-1.5 font-bold text-xs button-depth"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-4 border-2 border-gray-300 rounded-lg bg-white hover:border-[#D4AF37] transition-colors text-xs font-bold text-gray-700"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
            Entrar com Google
          </button>
        </form>

        <div className="text-center mt-1.5 pt-1 border-t border-[#D4AF37]/30">
          <p className="text-[#C92924]/70 text-xs mb-0.5">Ainda não é cadastrado?</p>
          <Link to="/cadastro" style={{ backgroundColor: '#FFF8E7', color: '#C92924' }} className="inline-block w-full border-2 border-gray-300 font-bold text-xs py-2 px-4 rounded-lg hover:border-[#D4AF37] transition-colors mt-2">
            Fazer cadastro
          </Link>
        </div>

        {/* Caixinha Promocional */}
        <div className="mt-3 p-6 rounded-xl flex items-center justify-start relative overflow-hidden border border-[#D4AF37]/20" style={{
          backgroundImage: 'url(/assets/caixinha.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          minHeight: '180px'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="relative z-10 flex-1 pr-4 flex items-center" style={{ maxWidth: '50%', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            <p className="text-[#C92924] font-semibold text-lg leading-tight font-sans">
              Dê um upgrade no seu cardápio com o <strong>MYMENU</strong>
            </p>
          </div>
        </div>

        <div className="mt-6 p-1 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-[#C92924]/30">
          <p className="text-xs font-bold text-[#C92924] mb-0.5 tracking-wide">CONTAS DE TESTE</p>
          <div className="text-xs text-[#C92924]/80 space-y-0.5">
            <div className="text-xs">
              <span className="text-xs"><strong>Admin:</strong></span>
              <span className="text-[#C92924]/70 ml-1 text-xs">admin@restaurante.com / 123456</span>
            </div>
            <div className="text-xs">
              <span className="text-xs"><strong>Consumidor:</strong></span>
              <span className="text-[#C92924]/70 ml-1 text-xs">consumidor@email.com / 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
