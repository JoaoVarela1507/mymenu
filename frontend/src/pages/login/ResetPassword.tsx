import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Input, Button, ImageCarousel } from '../../components/shared';
import './Login.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Link de redefinição de senha inválido.');
    }
  }, [token]);

  const validatePassword = (): boolean => {
    if (!password.trim()) {
      setError('Preencha a nova senha.');
      return false;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return false;
    }

    if (!confirmPassword.trim()) {
      setError('Confirme a nova senha.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erro ao redefinir a senha. Tente novamente.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
      console.error('Erro ao redefinir senha:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex">
        <div className="hidden lg:flex lg:w-7/12 relative">
          <ImageCarousel />
        </div>

        <div className="w-full lg:w-5/12 flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto relative z-10">
          <div className="glass-card-golden w-full max-w-lg shadow-2xl p-0 overflow-hidden flex flex-col">
            <div 
              className="bg-[#A30000] flex-shrink-0 flex items-center border-b-4 border-[#8B0000] relative p-6"
            >
              <h1 className="text-white text-2xl font-bold m-0">Link Inválido</h1>
            </div>

            <div className="p-8 flex flex-col gap-6">
              <p className="text-gray-700 text-center">
                Este link de redefinição de senha é inválido ou expirou.
              </p>
              <Link to="/forgot-password">
                <Button 
                  type="button"
                  className="w-full bg-[#A30000] text-white hover:bg-[#8B0000] transition-colors py-2 rounded-lg font-bold"
                >
                  Solicitar Novo Link
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex">
      {/* Coluna esquerda - Carrossel (55%) */}
      <div className="hidden lg:flex lg:w-7/12 relative">
        <ImageCarousel />
      </div>

      {/* Coluna direita - Formulário (45%) */}
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

            {/* Logo */}
            <div className="flex-1 text-center">
              <img 
                src="/assets/logo.png" 
                alt="Logo" 
                style={{ width: '60px', height: '60px', margin: '0 auto' }} 
              />
            </div>

            {/* Espaço vazio para balanceamento */}
            <div style={{ width: '180px' }}></div>
          </div>

          {/* CONTEÚDO PRINCIPAL */}
          <div className="p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center m-0">
              Redefinir Senha
            </h2>

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium text-center">
                  ✓ Senha redefinida com sucesso! Redirecionando...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">
                  ✗ {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Campo Nova Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#A30000] focus:ring-2 focus:ring-[#A30000]/20"
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#A30000] focus:ring-2 focus:ring-[#A30000]/20"
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Botão Redefinir */}
              <Button
                type="submit"
                disabled={loading || success}
                className="w-full bg-[#A30000] text-white hover:bg-[#8B0000] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors py-2 rounded-lg font-bold mt-4"
              >
                {loading ? 'Redefinindo...' : success ? '✓ Senha redefinida!' : 'Redefinir Senha'}
              </Button>
            </form>

            {/* Link para login */}
            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                Lembrou sua senha?{' '}
                <Link to="/login" className="text-[#A30000] font-semibold hover:underline">
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}