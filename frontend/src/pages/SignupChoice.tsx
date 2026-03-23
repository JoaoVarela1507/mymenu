import { Link } from 'react-router-dom';

export default function SignupChoice() {
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

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#6B1D1D] mb-2">Criar Conta</h1>
          <p className="text-[#6B1D1D]/70 text-sm">Escolha como deseja se cadastrar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Restaurante */}
          <Link to="/cadastro/restaurante">
            <div className="glass-card-golden hover:shadow-xl transition-all cursor-pointer h-full">
              <div className="text-center p-4">
                <div className="text-5xl mb-3">🏢</div>
                <h2 className="text-lg font-bold text-[#6B1D1D] mb-2">
                  Sou um Restaurante
                </h2>
                <p className="text-[#6B1D1D]/70 mb-4 text-xs">
                  Gerencie pedidos, cardápio e equipe em um só lugar
                </p>
                <div className="bg-amber-50/50 rounded-lg p-2.5 text-left text-xs text-[#6B1D1D]/70">
                  <p className="mb-1">✓ Central de pedidos unificada</p>
                  <p className="mb-1">✓ Gestão de cardápio</p>
                  <p className="mb-1">✓ Relatórios e métricas</p>
                  <p>✓ Convide sua equipe</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Consumidor */}
          <Link to="/cadastro/consumidor">
            <div className="glass-card-golden hover:shadow-xl transition-all cursor-pointer h-full">
              <div className="text-center p-4">
                <div className="text-5xl mb-3">👤</div>
                <h2 className="text-lg font-bold text-[#6B1D1D] mb-2">
                  Sou um Consumidor
                </h2>
                <p className="text-[#6B1D1D]/70 mb-4 text-xs">
                  Encontre restaurantes e compare preços
                </p>
                <div className="bg-amber-50/50 rounded-lg p-2.5 text-left text-xs text-[#6B1D1D]/70">
                  <p className="mb-1">✓ Busque restaurantes próximos</p>
                  <p className="mb-1">✓ Compare preços entre apps</p>
                  <p className="mb-1">✓ Salve seus favoritos</p>
                  <p>✓ Veja cardápios completos</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-6">
          <p className="text-[#6B1D1D]/70 text-sm">
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
