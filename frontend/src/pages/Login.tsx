import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button, Card } from '../components/shared';

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
    <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">MYMENU</h1>
          <p className="text-dark/60">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
          />

          {error && (
            <p className="text-status-cancelado text-sm">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link to="/cadastro" className="text-primary text-sm hover:underline">
            Não tem conta? Criar Conta
          </Link>
        </div>

        <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
          <p className="text-xs font-semibold text-dark mb-2">Contas de teste:</p>
          <div className="text-xs text-dark/70 space-y-1">
            <p><strong>Admin:</strong> admin@restaurante.com / 123456</p>
            <p><strong>Consumidor:</strong> consumidor@email.com / 123456</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
