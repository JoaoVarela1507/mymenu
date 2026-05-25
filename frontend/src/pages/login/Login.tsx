import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button, ImageCarousel } from '../../components/shared';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileModal, setProfileModal] = useState<{ email: string; password: string } | null>(null);
  const { login, loginWithProfile, cancelProfileChoice, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const linkedSuccess = (location.state as any)?.linked === true;

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email, password });

    if (result.success && result.needsProfileChoice) {
      setProfileModal({ email: '', password: '' });
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
    const ok = await loginWithProfile(profile);
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
    const result = await loginWithGoogle();
    if (result.success && result.needsProfileChoice) {
      setProfileModal({ email: '', password: '' });
      setLoading(false);
    } else if (result.success) {
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
              onClick={() => { setProfileModal(null); cancelProfileChoice(); }}
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

        {linkedSuccess && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-2.5 mb-2">
            <p className="text-green-700 text-xs font-semibold">✅ Perfil Consumidor vinculado! Faça login para escolher qual perfil usar.</p>
          </div>
        )}

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

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#C92924]">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="w-full bg-white border-2 border-dark/20 rounded-lg px-3 py-1.5 text-sm pr-10 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C92924] transition-colors"
                  style={{ width: 'auto', padding: 0 }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
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
        <div className="mt-3 p-4 rounded-xl flex items-center justify-start relative overflow-hidden border border-[#D4AF37]/20" style={{
          backgroundImage: 'url(/assets/caixinha.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          minHeight: '120px'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="relative z-10 flex-1 pr-4 flex items-center" style={{ maxWidth: '55%', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            <p className="text-[#C92924] font-semibold text-base leading-tight font-sans">
              Dê um upgrade no seu cardápio com o <strong>MYMENU</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
