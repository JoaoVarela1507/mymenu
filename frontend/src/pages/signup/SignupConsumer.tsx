import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, ImageCarousel } from '../../components/shared';
import { authService } from '../../services/api';
import { loginWithGoogle } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import '../login/Login';

export default function SignupConsumer() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailInfo, setEmailInfo] = useState<'free' | 'has_restaurant' | null>(null);

  const checkEmail = async (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setEmailChecking(true);
    try {
      const res = await fetch(`http://localhost:8000/restaurant/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setEmailInfo(data.exists ? 'has_restaurant' : 'free');
    } catch {}
    setEmailChecking(false);
  };
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.registerConsumer({
        name,
        email,
        password,
        confirmPassword
      });

      if (response.success) {
        navigate('/');
      } else {
        setError(response.message || 'Erro ao criar conta. Tente outro email.');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
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
      <div className="hidden lg:flex lg:w-7/12 relative">
        <ImageCarousel />
      </div>

      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto relative z-10">
        {/* Card com Glassmorfismo */}
        <div className="glass-card-golden w-full max-w-lg shadow-2xl p-0 overflow-hidden flex flex-col">
          
          {/* FAIXA VERMELHA */}
          <div 
            className="bg-[#A30000] flex-shrink-0 flex items-center border-b-4 border-[#8B0000] relative" 
            style={{
              marginLeft: '-50px',
              marginRight: '-50px',
              marginTop: '-50px',
              marginBottom: '0',
              paddingLeft: '50px',
              paddingRight: '50px',
              paddingTop: '1.5rem',
              paddingBottom: '1.5rem',
              width: 'calc(100% + 100px)',
              position: 'relative'
            }}
          >
            {/* Botão Voltar */}
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:opacity-80 transition-opacity font-bold"
              style={{
                position: 'absolute',
                right: '180px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Voltar"
            >
              <img src="/assets/voltar.png" alt="Voltar" style={{ width: '32px', height: '32px' }} />
            </button>

            {/* Título centralizado */}
            <h2 className="absolute text-white left-1/2 -translate-x-1/2 m-0 font-bold text-xl" style={{ color: '#FFFFFF' }}>
              Cadastro
            </h2>
          </div>

          {/* CONTEÚDO */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
            <div className="w-full max-w-sm">
            <div className="text-left mb-6">
              <h2 className="text-lg font-bold text-[#6B4423] m-0">Consumidor</h2>
              <p className="text-xs text-[#C92924]/70 m-0 whitespace-nowrap">Complete seus dados para criar a conta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome Completo"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="px-3 py-1.5 text-sm"
                required
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailInfo(null); }}
                onBlur={(e) => checkEmail(e.target.value)}
                placeholder="seu@email.com"
                className="px-3 py-1.5 text-sm"
                required
              />

              {emailChecking && (
                <p className="text-xs text-gray-400">Verificando email...</p>
              )}
              {emailInfo === 'has_restaurant' && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
                  <p className="text-amber-700 text-xs font-medium">⚠️ Este email já possui uma conta. <strong>Não é necessário criar outra conta</strong> — faça login com sua senha atual e escolha o perfil Consumidor.</p>
                  <Link to="/login" className="inline-block mt-2 text-xs font-bold text-amber-800 underline">Ir para o login →</Link>
                </div>
              )}

              {emailInfo !== 'has_restaurant' && (
              <>
              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha"
                className="px-3 py-1.5 text-sm"
                required
              />

              <Input
                label="Confirmar Senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                className="px-3 py-1.5 text-sm"
                required
              />

              <label className="checkbox-terms cursor-pointer py-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="text-xs text-[#6B4423]">
                  Concordo com os <span className="text-[#C92924] font-semibold">Termos de Serviço</span>
                </span>
              </label>

              {error && (
                <div className="bg-red-100/80 border border-red-300 rounded-lg p-2">
                  <p className="text-red-700 text-xs font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2 font-bold text-sm button-depth rounded-full bg-[#C92924] hover:bg-[#A02219]"
                disabled={!agreeTerms || loading}
              >
                {loading ? 'Criando conta...' : 'Acessar conta'}
              </Button>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-gray-300 rounded-full bg-white hover:border-[#D4AF37] transition-colors text-sm font-bold text-gray-700"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                Cadastrar com Google
              </button>
              </>
              )}
            </form>

            <div className="text-center pt-4 border-t border-[#D4AF37]/30 mt-4">
              <p className="text-[#C92924]/70 text-xs mb-2">Já tem uma conta?</p>
              <Link 
                to="/login" 
                className="inline-block w-full border-2 border-gray-300 font-bold text-xs py-1.5 px-4 rounded-lg text-[#C92924] hover:border-[#D4AF37] transition-colors"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                Fazer login
              </Link>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}