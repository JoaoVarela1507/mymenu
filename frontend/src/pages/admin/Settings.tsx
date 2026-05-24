import { useState, useEffect } from 'react';
import { Card, Button, PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { getRestaurantByOwnerId, updateRestaurantAppearance } from '../../lib/firestoreService';
import { getCurrentPlan, getPlanRule, planLimitLabel } from '../../lib/subscriptionPlan';
import type { RestaurantPlan } from '../../types/restaurant';

const planLabels: Record<RestaurantPlan, string> = {
  diamante: '💎 Diamante',
  ouro: '🥇 Ouro',
  prata: '🥈 Prata',
  basico: '🎯 Básico',
};

export default function Settings() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appearance, setAppearance] = useState({
    logo: '🍽️', headerColor: '#C92924', openTime: '11:00', closeTime: '23:00',
    deliveryTime: '30-45 min', minOrder: 0, description: '',
  });
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [appearanceSaved, setAppearanceSaved] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getRestaurantByOwnerId(user.id).then(rest => {
      setRestaurant(rest);
      if (rest) {
        setAppearance({
          logo: rest.logo || '🍽️',
          headerColor: rest.headerColor || '#C92924',
          openTime: rest.openTime || '11:00',
          closeTime: rest.closeTime || '23:00',
          deliveryTime: rest.deliveryTime || '30-45 min',
          minOrder: rest.minOrder || 0,
          description: rest.description || '',
        });
      }
      setLoading(false);
    });
  }, [user?.id]);

  const handleSaveAppearance = async () => {
    if (!user?.id) return;
    setSavingAppearance(true);
    const now = new Date();
    const [openH, openM] = appearance.openTime.split(':').map(Number);
    const [closeH, closeM] = appearance.closeTime.split(':').map(Number);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;
    const isOpen = nowMin >= openMin && nowMin < closeMin;
    await updateRestaurantAppearance(user.id, { ...appearance, isOpen });
    setSavingAppearance(false);
    setAppearanceSaved(true);
    setTimeout(() => setAppearanceSaved(false), 3000);
  };

  if (!user || user.type !== 'admin') return null;

  const activePlan = getCurrentPlan();
  const activeRule = getPlanRule(activePlan);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      <PageHeader
        title="Configurações"
        subtitle="Gerencie as informações do restaurante"
        icon="⚙️"
      />

      <div className="max-w-4xl mx-auto px-8 py-12 space-y-8">
        {/* Resumo do Restaurante */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">🏪 Meu Restaurante</h2>
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : restaurant ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Nome</p>
                <p className="font-semibold text-gray-800">{restaurant.restaurantName}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Categoria</p>
                <p className="font-semibold text-gray-800">{restaurant.category || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Cidade / Estado</p>
                <p className="font-semibold text-gray-800">{[restaurant.city, restaurant.state].filter(Boolean).join(', ') || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Endereço</p>
                <p className="font-semibold text-gray-800">{restaurant.address || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Telefone</p>
                <p className="font-semibold text-gray-800">{restaurant.restaurantPhone || restaurant.ownerPhone || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">CNPJ</p>
                <p className="font-semibold text-gray-800">{restaurant.cnpj || '—'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Restaurante não encontrado.</p>
          )}
        </Card>

        {/* Aparência */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎨 Aparência do Restaurante</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ícone / Logo (emoji)</label>
              <input
                type="text"
                value={appearance.logo}
                onChange={e => setAppearance(a => ({ ...a, logo: e.target.value.slice(0, 2) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-2xl focus:outline-none focus:ring-2 focus:ring-[#660000]"
                maxLength={2}
                placeholder="🍽️"
              />
              <p className="text-xs text-gray-400 mt-1">Cole um emoji para representar seu restaurante</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cor do cabeçalho</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={appearance.headerColor}
                  onChange={e => setAppearance(a => ({ ...a, headerColor: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-mono">{appearance.headerColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tempo de entrega</label>
              <input
                type="text"
                value={appearance.deliveryTime}
                onChange={e => setAppearance(a => ({ ...a, deliveryTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#660000]"
                placeholder="Ex: 30-45 min"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pedido mínimo (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={appearance.minOrder}
                onChange={e => setAppearance(a => ({ ...a, minOrder: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#660000]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
              <textarea
                value={appearance.description}
                onChange={e => setAppearance(a => ({ ...a, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#660000]"
                placeholder="Descreva seu restaurante para os clientes..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Horário de abertura</label>
              <input
                type="time"
                value={appearance.openTime}
                onChange={e => setAppearance(a => ({ ...a, openTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#660000]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Horário de fechamento</label>
              <input
                type="time"
                value={appearance.closeTime}
                onChange={e => setAppearance(a => ({ ...a, closeTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#660000]"
              />
              <p className="text-xs text-gray-400 mt-1">O status aberto/fechado é calculado automaticamente pelo horário</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveAppearance}
              disabled={savingAppearance}
              className="bg-[#660000] hover:bg-[#550000] text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-60"
            >
              {savingAppearance ? 'Salvando...' : '💾 Salvar Aparência'}
            </Button>
            {appearanceSaved && <span className="text-sm text-green-600 font-semibold">✅ Salvo!</span>}
          </div>
        </Card>

        {/* Plano */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-2">📊 Plano Atual</h2>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Plano ativo: <span className="font-bold">{planLabels[activePlan]}</span> &nbsp;·&nbsp;
              Produtos: <span className="font-bold">{planLimitLabel(activeRule.maxProducts)}</span>
            </p>
            <a
              href="/admin/plans"
              className="text-sm font-semibold text-[#660000] hover:underline"
            >
              Gerenciar plano →
            </a>
          </div>
        </Card>

        {/* Conta */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Minha Conta</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Nome</p>
              <p className="font-semibold text-gray-800">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-800">{user.email}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
