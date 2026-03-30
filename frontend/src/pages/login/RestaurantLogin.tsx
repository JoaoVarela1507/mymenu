import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../../components/shared';
import { authService } from '../../services/api';
import './RestaurantLogin.css';

export default function RestaurantLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.success && response.user?.type === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError(response.message || 'Email ou senha inválidos');
      }
    } catch (err) {
      setError('Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restaurant-login-container">
      {/* Lado Esquerdo - Imagem */}
      <div className="restaurant-login-image">
        <div 
          className="image-background"
          style={{
            backgroundImage: 'url(/assets/imagem.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="image-overlay"></div>
        </div>
      </div>

      {/* Lado Direito - Login */}
      <div className="restaurant-login-panel">
        <div className="login-content">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark mb-2">Restaurante</h1>
            <p className="text-dark/70 text-sm">Faça login para gerenciar seu restaurante</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@restaurante.com"
                className="restaurant-input"
                required
              />

              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="restaurant-input"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 font-semibold text-base restaurant-button"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-dark/10">
            <p className="text-dark/70 text-sm mb-2">Não tem uma conta?</p>
            <Link to="/cadastro/restaurante" className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors">
              Cadastrar Restaurante
            </Link>
          </div>

          {/* Banner de Upgrade */}
          <div className="mt-6">
            <img 
              src="/assets/caixinha.png" 
              alt="Upgrade Banner" 
              className="w-full rounded-xl shadow-lg upgrade-banner"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
