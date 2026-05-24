import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, ImageCarousel } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { getRestaurantByOwnerId } from '../../lib/firestoreService';

export default function Dashboard() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getRestaurantByOwnerId(user.id).then(rest => {
      setRestaurant(rest);
      setLoading(false);
    });
  }, [user?.id]);

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      {/* Hero com carrossel */}
      <div className="relative w-full h-[420px] overflow-hidden">
        <ImageCarousel autoPlayInterval={4500} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/75" />

        <div className="absolute inset-0 flex flex-col justify-between z-10">
          <div className="max-w-7xl mx-auto w-full px-8 pt-8">
            <div className="flex items-center text-white">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src="/assets/logo_2.png"
                    alt="MyMenu"
                    className="h-14 w-auto drop-shadow-lg"
                  />
                  <div className="h-10 w-px bg-white/30" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] opacity-80 mb-1">Painel administrativo</p>
                    <p className="text-sm md:text-base text-white/90 font-medium">
                      Gerencie seu restaurante no MyMenu
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 mt-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 shadow-lg">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/70 font-semibold">Restaurante</span>
                  <span className="text-base md:text-lg font-bold text-white drop-shadow-sm">
                    {loading ? '...' : (restaurant?.restaurantName || 'Seu Restaurante')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto w-full px-8 pb-8">
            <div className="grid grid-cols-2 gap-4 text-white max-w-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
                <p className="text-xs uppercase tracking-wide text-white/70 mb-1">Categoria</p>
                <p className="text-base font-bold">{restaurant?.category || '—'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
                <p className="text-xs uppercase tracking-wide text-white/70 mb-1">Plano</p>
                <p className="text-base font-bold capitalize">{restaurant?.plan || 'básico'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Informações do Restaurante */}
        <Card className="mb-12">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Informações do Restaurante</h2>
              {loading ? (
                <p className="text-gray-400">Carregando...</p>
              ) : restaurant ? (
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nome</p>
                    <p className="font-semibold text-gray-800">{restaurant.restaurantName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Categoria</p>
                    <p className="font-semibold text-gray-800">{restaurant.category || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cidade</p>
                    <p className="font-semibold text-gray-800">{restaurant.city || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Plano</p>
                    <p className="font-semibold text-gray-800 capitalize">{restaurant.plan || 'básico'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Proprietário</p>
                    <p className="font-semibold text-gray-800">{restaurant.ownerName || user?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                    <p className="font-semibold" style={{ color: restaurant.isOpen ? '#22c55e' : '#ef4444' }}>
                      {restaurant.isOpen ? '🟢 Aberto' : '🔴 Fechado'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Restaurante não encontrado. Verifique seu cadastro.</p>
              )}
            </div>
            <div className="text-7xl flex-shrink-0">{restaurant?.logo || '🍽️'}</div>
          </div>
        </Card>

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
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Central de Pedidos</h3>
                  <p className="text-sm text-gray-600">Visualizar e gerenciar pedidos das mesas</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/promotions">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🎁</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Promoções</h3>
                  <p className="text-sm text-gray-600">Crie e gerencie promoções do seu restaurante</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/settings">
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="text-5xl">⚙️</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Configurações</h3>
                  <p className="text-sm text-gray-600">Gerenciar plano e configurações da conta</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Relatórios Em Breve */}
        <Card>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-5xl">📊</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Relatórios</h3>
              <p className="text-sm text-gray-600">
                Em breve: importe sua planilha Excel para visualizar relatórios detalhados de vendas e performance.
              </p>
            </div>
            <Link
              to="/admin/reports"
              className="px-4 py-2 border-2 border-[#660000] text-[#660000] rounded-lg text-sm font-semibold hover:bg-[#660000] hover:text-white transition-colors whitespace-nowrap"
            >
              Ver Relatórios
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
