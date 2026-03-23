import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/shared';
import './Login.css';

export default function SignupConsumer() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (!acceptTerms) {
      setError('Você deve aceitar os termos de uso');
      return;
    }

    setLoading(true);

    // TODO: Implementar cadastro real no backend
    setTimeout(() => {
      alert('Cadastro realizado! (mockado)');
      navigate('/login');
    }, 1000);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-2 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay com padrão de ícones de cozinha desfocados */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 via-amber-50/30 to-yellow-100/40">
        <div className="absolute inset-0 opacity-15">
          <div className="text-8xl absolute top-10 left-10 text-amber-800 blur-3xl">🍳</div>
          <div className="text-8xl absolute top-1/4 right-20 text-amber-700 blur-3xl">🍴</div>
          <div className="text-8xl absolute bottom-20 left-1/3 text-amber-800 blur-3xl">🥘</div>
          <div className="text-8xl absolute bottom-1/4 right-10 text-amber-700 blur-3xl">🔪</div>
          <div className="text-8xl absolute top-1/2 left-1/4 text-amber-600 blur-3xl">🍽️</div>
          <div className="text-8xl absolute top-1/3 right-1/3 text-amber-800 blur-3xl">👨‍🍳</div>
        </div>
      </div>

      {/* Card com Glassmorfismo e Borda Dourada */}
      <div className="glass-card-golden w-full max-w-md relative z-10 shadow-2xl">
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold text-[#6B1D1D] mb-0.5">Criar Conta</h1>
          <p className="text-[#6B1D1D]/70 font-medium text-xs">Cadastre-se como consumidor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-1">
          <Input
            label="Nome Completo"
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
            placeholder="Mínimo 6 caracteres"
            className="px-3 py-1.5 text-sm"
            required
          />

          <Input
            label="Confirmar Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Digite a senha novamente"
            className="px-3 py-1.5 text-sm"
            required
          />

          <div className="flex items-start gap-2 mt-1">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-xs text-[#6B1D1D]/70">
              Aceito os{' '}
              <a href="#" className="text-[#C92924] hover:text-[#A02219]">
                termos de uso
              </a>{' '}
              e{' '}
              <a href="#" className="text-[#C92924] hover:text-[#A02219]">
                política de privacidade
              </a>
            </label>
          </div>

          {error && (
            <div className="bg-red-100/80 border border-red-300 rounded-lg p-1.5">
              <p className="text-red-700 text-xs font-medium">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-1.5 font-bold text-xs button-depth mt-1" 
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div className="text-center mt-1.5">
          <p className="text-[#6B1D1D]/70 text-xs">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#C92924] font-semibold hover:text-[#A02219] transition-colors">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
