import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, ImageCarousel } from '../../components/shared';
import { authService } from '../../services/api';
import '../login/Login';

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

    try {
      const response = await authService.registerRestaurant({
        restaurantName,
        cnpj,
        phone,
        address,
        category,
        name,
        email,
        password,
        confirmPassword
      });

      if (response.success) {
        navigate('/');
      } else {
        setError(response.message || 'Erro ao criar conta. Verifique os dados.');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex">
      {/* Coluna esquerda - Carrossel (55%) */}
      <div className="hidden lg:flex lg:w-7/12 relative">
        <ImageCarousel />
      </div>

      {/* Coluna direita - Cadastro (45%) */}
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
            
            {/* Subtitle */}
            <div className="mb-5 text-left">
              <h2 className="text-lg font-semibold text-[#C92924] mb-1">Restaurante</h2>
              <p className="text-xs text-[#6B4423]/70 whitespace-nowrap">Complete os dados do seu restaurante e de administrador</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Dados do Restaurante */}
              <div>
                <h3 className="text-xs font-semibold text-[#6B4423] mb-3 tracking-wide">DADOS DO RESTAURANTE</h3>
                <div className="space-y-1">
                  <Input
                    label="Nome do Restaurante"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Meu Restaurante"
                    className="px-3 py-1.5 text-sm"
                    required
                  />

                  <Input
                    label="CNPJ"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="px-3 py-1.5 text-sm"
                    required
                  />

                  <Input
                    label="Telefone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="px-3 py-1.5 text-sm"
                    required
                  />

                  <Input
                    label="Categoria"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Italiana, Japonesa"
                    className="px-3 py-1.5 text-sm"
                    required
                  />

                  <Input
                    label="Endereço Completo"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                    className="px-3 py-1.5 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Dados do Admin */}
              <div>
                <h3 className="text-xs font-semibold text-[#6B4423] mb-5 tracking-wide">SEUS DADOS (ADMINISTRADOR)</h3>
                <div className="space-y-1">
                  <Input
                    label="Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="px-3 py-1.5 text-sm"
                    required
                  />

                  <Input
                    label="Email Corporativo"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@restaurante.com"
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
                </div>
              </div>

              <label className="checkbox-terms mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span className="text-xs text-[#6B4423]/70">
                  Aceito os{' '}
                  <a href="#" className="text-[#C92924] hover:text-[#A02219]">
                    termos de uso
                  </a>{' '}
                  e{' '}
                  <a href="#" className="text-[#C92924] hover:text-[#A02219]">
                    política de privacidade
                  </a>
                </span>
              </label>

              {error && (
                <div className="bg-red-100/80 border border-red-300 rounded-lg p-1.5">
                  <p className="text-red-700 text-xs font-medium">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-2 font-bold text-sm button-depth mt-3 rounded-full bg-[#C92924] hover:bg-[#A02219]" 
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Acessar conta'}
              </Button>
            </form>
            {/* Link para Login */}
            <div className="text-center pt-3 border-t border-[#D4AF37]/30 mt-4">
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
