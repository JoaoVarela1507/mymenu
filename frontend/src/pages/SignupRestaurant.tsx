import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Card } from '../components/shared';

export default function SignupRestaurant() {
  const [restaurantName, setRestaurantName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
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

    if (!restaurantName || !cnpj || !phone || !address || !category || !name || !email || !password) {
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
      alert('Restaurante cadastrado! (mockado)');
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Cadastrar Restaurante</h1>
          <p className="text-dark/60">Crie sua conta e comece a gerenciar seu restaurante</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Restaurante */}
          <div>
            <h2 className="text-lg font-semibold text-dark mb-4">Dados do Restaurante</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Restaurante"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Meu Restaurante"
                required
              />

              <Input
                label="CNPJ"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                required
              />

              <Input
                label="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />

              <Input
                label="Categoria"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Italiana, Japonesa"
                required
              />
            </div>

            <div className="mt-4">
              <Input
                label="Endereço Completo"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                required
              />
            </div>
          </div>

          {/* Dados do Admin */}
          <div>
            <h2 className="text-lg font-semibold text-dark mb-4">Seus Dados (Administrador)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />

              <Input
                label="Email Corporativo"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@restaurante.com"
                required
              />

              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />

              <Input
                label="Confirmar Senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-dark/70">
              Aceito os{' '}
              <a href="#" className="text-primary hover:underline">
                termos de uso
              </a>{' '}
              e{' '}
              <a href="#" className="text-primary hover:underline">
                política de privacidade
              </a>
            </label>
          </div>

          {error && <p className="text-status-cancelado text-sm">{error}</p>}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-dark/60 text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
