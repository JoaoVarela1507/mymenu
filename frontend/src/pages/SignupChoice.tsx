import { Link } from 'react-router-dom';
import { Card } from '../components/shared';

export default function SignupChoice() {
  return (
    <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">MYMENU</h1>
          <p className="text-dark/60">Escolha como deseja se cadastrar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Restaurante */}
          <Link to="/cadastro/restaurante">
            <Card className="hover:shadow-xl transition-all cursor-pointer h-full">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🏢</div>
                <h2 className="text-2xl font-bold text-dark mb-2">
                  Sou um Restaurante
                </h2>
                <p className="text-dark/60 mb-6">
                  Gerencie pedidos, cardápio e equipe em um só lugar
                </p>
                <div className="bg-secondary/50 rounded-lg p-4 text-left text-sm text-dark/70">
                  <p className="mb-2">✓ Central de pedidos unificada</p>
                  <p className="mb-2">✓ Gestão de cardápio</p>
                  <p className="mb-2">✓ Relatórios e métricas</p>
                  <p>✓ Convide sua equipe</p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Consumidor */}
          <Link to="/cadastro/consumidor">
            <Card className="hover:shadow-xl transition-all cursor-pointer h-full">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-dark mb-2">
                  Sou um Consumidor
                </h2>
                <p className="text-dark/60 mb-6">
                  Encontre restaurantes e compare preços
                </p>
                <div className="bg-secondary/50 rounded-lg p-4 text-left text-sm text-dark/70">
                  <p className="mb-2">✓ Busque restaurantes próximos</p>
                  <p className="mb-2">✓ Compare preços entre apps</p>
                  <p className="mb-2">✓ Salve seus favoritos</p>
                  <p>✓ Veja cardápios completos</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-dark/60">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
