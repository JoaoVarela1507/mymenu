import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button } from '../../components/shared';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login({ email, password });

    if (success) {
      navigate('/');
    } else {
      setError('Email ou senha inválidos');
    }

    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden flex"
      style={{
        backgroundImage: 'url(/assets/imagem.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Coluna esquerda - Imagem (55%) */}
      <div className="hidden lg:block w-7/12 relative">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Coluna direita - Formulário de Login (45%) */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto relative z-10">
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
