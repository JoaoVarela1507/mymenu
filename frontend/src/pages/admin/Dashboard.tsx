import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { mockRestaurants } from '../../lib/mockRestaurants';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Restaurantes cadastrados do admin (apenas 3 do mock)
  const adminRestaurants = mockRestaurants.slice(0, 3);
  
  // Carregar do localStorage ao montar, senão usar o primeiro restaurante do admin
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(() => {
    const saved = localStorage.getItem('selectedRestaurantId');
    if (saved && adminRestaurants.find(r => r.id === saved)) {
      return saved;
    }
    return adminRestaurants[0]?.id || user?.restaurantId;
  });

  // Salvar no localStorage sempre que muda
  useEffect(() => {
    if (selectedRestaurantId) {
      localStorage.setItem('selectedRestaurantId', selectedRestaurantId);
    }
  }, [selectedRestaurantId]);
  
  // Obter dados do restaurante do admin
  const restaurant = adminRestaurants.find(r => r.id === selectedRestaurantId);

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold" style={{ color: '#660000' }}>
              Visão Geral - {restaurant?.name || 'Seu Restaurante'}
            </h1>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Mudar restaurante:</label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white cursor-pointer hover:border-gray-400"
              >
                {adminRestaurants.map(rest => (
                  <option key={rest.id} value={rest.id}>
                    {rest.logo} {rest.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-gray-600">Bem-vindo, {user?.name}! Aqui está um resumo do seu negócio.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Informações do Restaurante */}
        {restaurant && (
          <Card className="mb-12">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Informações do Restaurante</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nome</p>
                    <p className="text-lg font-semibold text-gray-800">{restaurant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Categoria</p>
                    <p className="text-lg font-semibold text-gray-800">{restaurant.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Distância</p>
                    <p className="text-lg font-semibold text-gray-800">{restaurant.distance} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tempo de Entrega</p>
                    <p className="text-lg font-semibold text-gray-800">{restaurant.deliveryTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avaliação</p>
                    <p className="text-lg font-semibold text-gray-800">⭐ {restaurant.rating}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="text-lg font-semibold" style={{ color: restaurant.isOpen ? '#22c55e' : '#ef4444' }}>
                      {restaurant.isOpen ? '🟢 Aberto' : '🔴 Fechado'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-8xl">{restaurant.logo}</div>
            </div>
          </Card>
        )}

        {/* Canais de Venda */}
        <Card className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 Canais de Venda Integrados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-3xl">🍔</span>
              <p className="text-sm font-medium text-gray-700 text-center">iFood</p>
              <p className="text-xs text-green-600 font-semibold">✓ Ativo</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-3xl">🚗</span>
              <p className="text-sm font-medium text-gray-700 text-center">Uber Eats</p>
              <p className="text-xs text-green-600 font-semibold">✓ Ativo</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-3xl">📦</span>
              <p className="text-sm font-medium text-gray-700 text-center">Rappi</p>
              <p className="text-xs text-gray-500 font-semibold">○ Inativo</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-3xl">🛵</span>
              <p className="text-sm font-medium text-gray-700 text-center">99Food</p>
              <p className="text-xs text-green-600 font-semibold">✓ Ativo</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-4">ℹ️ Gerencie seus canais de venda em <a href="/admin/settings/integracoes" className="font-semibold" style={{ color: '#660000' }}>Configurações &gt; Integrações</a></p>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Pedidos Hoje</p>
                <p className="text-4xl font-bold" style={{ color: '#660000' }}>24</p>
                <p className="text-xs text-green-600 mt-2">+12% vs. ontem</p>
              </div>
              <span className="text-3xl">📦</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Faturamento</p>
                <p className="text-4xl font-bold" style={{ color: '#660000' }}>R$ 1.240</p>
                <p className="text-xs text-green-600 mt-2">+8% vs. ontem</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Ticket Médio</p>
                <p className="text-4xl font-bold" style={{ color: '#660000' }}>R$ 51,67</p>
                <p className="text-xs text-gray-500 mt-2">Estável</p>
              </div>
              <span className="text-3xl">💳</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Avaliação</p>
                <p className="text-4xl font-bold" style={{ color: '#660000' }}>{restaurant?.rating}</p>
                <p className="text-xs text-gray-500 mt-2">⭐ Excelente</p>
              </div>
              <span className="text-3xl">👍</span>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link to="/admin/menu">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="text-5xl">📋</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Gerenciar Cardápio</h3>
                  <p className="text-sm text-gray-600">Adicionar, editar ou remover itens do menu</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/orders">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="text-5xl">📲</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Pedidos Recebidos</h3>
                  <p className="text-sm text-gray-600">Visualizar e gerenciar pedidos em tempo real</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/settings">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="text-5xl">⚙️</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Configurações da Loja</h3>
                  <p className="text-sm text-gray-600">Editar horário, fotos e endereço</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/reports">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="text-5xl">📊</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Relatórios</h3>
                  <p className="text-sm text-gray-600">Análises detalhadas de vendas e performance</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200" style={{ borderBottomColor: '#660000' }}>
            Pedidos Recentes
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-semibold text-gray-800">Pedido #{1000 + i}</p>
                  <p className="text-sm text-gray-600">Cliente: João Silva</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#660000' }}>R$ 65,90</p>
                  <p className="text-xs text-green-600 font-medium">✓ Confirmado</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
