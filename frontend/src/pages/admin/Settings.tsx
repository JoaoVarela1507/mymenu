import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Input, Button, PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { mockRestaurants } from '../../lib/mockRestaurants';
import type { RestaurantPlan } from '../../types/restaurant';
import {
  getCurrentPlan,
  getPlanRule,
  setCurrentPlan,
  canAddRestaurant,
  planLimitLabel,
  type SubscriptionPlan,
} from '../../lib/subscriptionPlan';

const planLabels: Record<RestaurantPlan, string> = {
  diamante: '💎 Diamante',
  ouro: '🥇 Ouro',
  prata: '🥈 Prata',
  basico: '🎯 Básico',
};

const planDescriptions: Record<RestaurantPlan, string> = {
  diamante: 'Máxima prioridade na listagem + destaque no carrossel',
  ouro: 'Alta prioridade na listagem + destaque no carrossel',
  prata: 'Prioridade média na listagem',
  basico: 'Listagem padrão',
};

export default function Settings() {
  const { user } = useAuth();
  const { tab } = useParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<'geral' | 'integracoes' | 'restaurantes'>('geral');
  
  // Restaurantes cadastrados do admin (apenas 3 do mock)
  const adminRestaurants = mockRestaurants.slice(0, 3);
  
  // Carregar do localStorage ao montar, senão usar o primeiro restaurante do admin
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(() => {
    const saved = localStorage.getItem('selectedRestaurantId');
    if (saved && adminRestaurants.find(r => r.id === saved)) {
      return saved;
    }
    return adminRestaurants[0]?.id || user?.restaurantId || '';
  });

  // Salvar no localStorage sempre que muda
  useEffect(() => {
    if (selectedRestaurantId) {
      localStorage.setItem('selectedRestaurantId', selectedRestaurantId);
    }
  }, [selectedRestaurantId, adminRestaurants]);

  const selectedRestaurant = adminRestaurants.find(r => r.id === selectedRestaurantId);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(getCurrentPlan());

  const [channels, setChannels] = useState({
    ifood: true,
    uberEats: true,
    rappi: true,
    ninetyNineFood: false,
  });

  // State para cadastro de restaurante
  const [showNewRestaurantForm, setShowNewRestaurantForm] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    phone: '',
    address: '',
  });
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    category: '',
    phone: '',
    address: '',
    proof: '', // comprovante
  });

  useEffect(() => {
    if (tab && ['geral', 'integracoes', 'restaurantes'].includes(tab)) {
      setActiveTab(tab as 'geral' | 'integracoes' | 'restaurantes');
    }
  }, [tab]);

  if (!user || user.type !== 'admin') return null;

  const restaurant = selectedRestaurant;
  const activePlan = getCurrentPlan();
  const activeRule = getPlanRule(activePlan);

  const planOptions: Array<{
    id: SubscriptionPlan;
    label: string;
    shortLabel: string;
    description: string;
    badge: string;
  }> = [
    {
      id: 'diamante',
      label: 'Diamante',
      shortLabel: 'Top',
      description: 'Máxima prioridade, destaque e presença premium no app.',
      badge: '💎',
    },
    {
      id: 'ouro',
      label: 'Ouro',
      shortLabel: 'Destaque',
      description: 'Alta prioridade na listagem com bom equilíbrio de custo e visibilidade.',
      badge: '🥇',
    },
    {
      id: 'prata',
      label: 'Prata',
      shortLabel: 'Base',
      description: 'Prioridade intermediária para manter presença consistente.',
      badge: '🥈',
    },
  ];

  const handleSavePlan = () => {
    setCurrentPlan(selectedPlan);
    const rule = getPlanRule(selectedPlan);
    alert(
      `✅ Plano contratado atualizado para ${planLabels[selectedPlan]}!\n\nLimites atuais:\n- Restaurantes: ${planLimitLabel(rule.maxRestaurants)}\n- Produtos: ${planLimitLabel(rule.maxProducts)}`
    );
  };

  const quickStats = [
    { label: 'Avaliação', value: `⭐ ${restaurant?.rating || '-'}`, hint: 'Média dos clientes' },
    { label: 'Distância', value: `${restaurant?.distance || '-'} km`, hint: 'Raio de entrega' },
    { label: 'Entrega', value: restaurant?.deliveryTime || '-', hint: 'Tempo estimado' },
    { label: 'Pedido mín.', value: `R$ ${restaurant?.minOrder?.toFixed(2) || '0,00'}`, hint: 'Valor mínimo' },
  ];

  const handleSaveSettings = () => {
    if (editingRestaurantId) {
      alert('✅ Dados do restaurante atualizados com sucesso!');
      setEditingRestaurantId(null);
    } else {
      alert('✅ Configurações salvas com sucesso!');
    }
  };

  const handleCreateRestaurant = () => {
    if (!newRestaurant.name || !newRestaurant.category || !newRestaurant.proof) {
      alert('❌ Preencha todos os campos obrigatórios (Nome, Categoria, Comprovação)');
      return;
    }

    if (!canAddRestaurant(adminRestaurants.length, activePlan)) {
      alert(
        `🚫 Limite do plano ${planLabels[activePlan]} atingido.\n\nVocê pode cadastrar até ${planLimitLabel(activeRule.maxRestaurants)} restaurante(s).\nFaça upgrade em /admin/plans para liberar mais.`
      );
      return;
    }
    
    alert(`✅ Restaurante "${newRestaurant.name}" cadastrado com sucesso!\n\n✔️ Comprovação recebida: ${newRestaurant.proof}`);
    setNewRestaurant({ name: '', category: '', phone: '', address: '', proof: '' });
    setShowNewRestaurantForm(false);
  };

  const handleEditRestaurant = (id: string) => {
    setSelectedRestaurantId(id);
    const restToEdit = adminRestaurants.find(r => r.id === id);
    if (restToEdit) {
      setEditFormData({
        name: restToEdit.name,
        category: restToEdit.category,
        phone: '',
        address: '',
      });
      setEditingRestaurantId(id);
      setActiveTab('restaurantes');
    }
  };

  const handleDeleteRestaurant = (id: string) => {
    const restaurantToDelete = adminRestaurants.find(r => r.id === id);
    alert(`❌ Restaurante "${restaurantToDelete?.name}" deletado. (Este é um modo demo)`);
  };

  const handleCancelEdit = () => {
    setEditingRestaurantId(null);
    setEditFormData({ name: '', category: '', phone: '', address: '' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      <PageHeader 
        title="Configurações" 
        subtitle="Gerencie as informações do restaurante"
        icon="⚙️"
      />
      
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b-2 overflow-x-auto" style={{ borderBottomColor: '#660000' }}>
          <button
            onClick={() => setActiveTab('geral')}
            className={`pb-3 px-2 font-bold text-lg transition-colors whitespace-nowrap ${
              activeTab === 'geral'
                ? 'text-white px-4 py-1 rounded-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{
              backgroundColor: activeTab === 'geral' ? '#660000' : 'transparent',
            }}
          >
            Geral
          </button>
          <button
            onClick={() => setActiveTab('restaurantes')}
            className={`pb-3 px-2 font-bold text-lg transition-colors whitespace-nowrap ${
              activeTab === 'restaurantes'
                ? 'text-white px-4 py-1 rounded-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{
              backgroundColor: activeTab === 'restaurantes' ? '#660000' : 'transparent',
            }}
          >
            Meus Restaurantes
          </button>
          <button
            onClick={() => setActiveTab('integracoes')}
            className={`pb-3 px-2 font-bold text-lg transition-colors whitespace-nowrap ${
              activeTab === 'integracoes'
                ? 'text-white px-4 py-1 rounded-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{
              backgroundColor: activeTab === 'integracoes' ? '#660000' : 'transparent',
            }}
          >
            Integrações
          </button>
        </div>

        <div className="space-y-8">
          {/* Tab Geral */}
          {activeTab === 'geral' && (
            <>
              {restaurant && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {quickStats.map(stat => (
                      <Card key={stat.label} className="bg-white border border-gray-200">
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-2">{stat.hint}</p>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Plano Atual</h2>
                    <div className="mb-5 p-4 rounded-lg border" style={{ backgroundColor: '#fff3cd', borderColor: '#f2d28f' }}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                        <div>
                          <span className="text-2xl font-bold" style={{ color: '#660000' }}>
                            {planLabels[selectedPlan]}
                          </span>
                          <p className="text-sm text-gray-700 mt-1">{planDescriptions[selectedPlan]}</p>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><span className="font-semibold">Restaurante:</span> {restaurant.name}</p>
                          <p><span className="font-semibold">Categoria:</span> {restaurant.category}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
                      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Limites do plano contratado</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                          <p className="text-gray-500">Restaurantes</p>
                          <p className="text-lg font-bold text-gray-800">{planLimitLabel(getPlanRule(selectedPlan).maxRestaurants)}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                          <p className="text-gray-500">Produtos</p>
                          <p className="text-lg font-bold text-gray-800">{planLimitLabel(getPlanRule(selectedPlan).maxProducts)}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                          <p className="text-gray-500">Relatórios avançados</p>
                          <p className="text-lg font-bold text-gray-800">{getPlanRule(selectedPlan).advancedReports ? 'Liberado' : 'Bloqueado'}</p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Editar plano</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {planOptions.map(option => {
                        const isActive = selectedPlan === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => setSelectedPlan(option.id)}
                            className={`text-left rounded-xl border-2 p-4 transition-all ${
                              isActive ? 'border-[#660000] bg-red-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-2xl">{option.badge}</span>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isActive ? 'bg-[#660000] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                {option.shortLabel}
                              </span>
                            </div>
                            <p className="text-lg font-bold text-gray-800">{planLabels[option.id]}</p>
                            <p className="text-sm text-gray-600 mt-2">{option.description}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-5 gap-4 flex-wrap">
                      <p className="text-xs text-gray-600">ℹ️ O plano altera prioridade, destaque e percepção do restaurante no app.</p>
                      <Button onClick={handleSavePlan} className="bg-[#660000] hover:bg-[#550000] text-white px-6 py-2 rounded-lg font-semibold">
                        💾 Salvar Plano
                      </Button>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <h2 className="text-lg font-bold text-gray-800 mb-4">🏪 Resumo da Loja</h2>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex justify-between gap-4"><span className="text-gray-500">Nome</span><span className="font-semibold text-right">{restaurant.name}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-gray-500">Categoria</span><span className="font-semibold text-right">{restaurant.category}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-gray-500">Plano atual</span><span className="font-semibold text-right">{planLabels[selectedPlan]}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-gray-500">Status</span><span className="font-semibold text-right" style={{ color: restaurant.isOpen ? '#22c55e' : '#ef4444' }}>{restaurant.isOpen ? 'Aberto' : 'Fechado'}</span></div>
                      </div>
                    </Card>

                    <Card>
                      <h2 className="text-lg font-bold text-gray-800 mb-4">⚡ Atalhos</h2>
                      <div className="space-y-3">
                        <Link to="/admin/menu" className="block rounded-lg border border-gray-200 px-4 py-3 hover:border-[#660000] hover:bg-red-50 transition-colors">
                          <p className="font-semibold text-gray-800">Editar cardápio</p>
                          <p className="text-sm text-gray-600">Atualize produtos e ofertas do restaurante.</p>
                        </Link>
                        <Link to="/admin/reports" className="block rounded-lg border border-gray-200 px-4 py-3 hover:border-[#660000] hover:bg-red-50 transition-colors">
                          <p className="font-semibold text-gray-800">Ver relatórios</p>
                          <p className="text-sm text-gray-600">Acompanhe vendas, ticket e desempenho.</p>
                        </Link>
                        <Link to="/admin/settings/integracoes" className="block rounded-lg border border-gray-200 px-4 py-3 hover:border-[#660000] hover:bg-red-50 transition-colors">
                          <p className="font-semibold text-gray-800">Integrações</p>
                          <p className="text-sm text-gray-600">Gerencie iFood, Uber Eats, Rappi e 99Food.</p>
                        </Link>
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}

          {/* Tab Meus Restaurantes */}
          {activeTab === 'restaurantes' && (
            <>
              {/* Novo Restaurante */}
              {!showNewRestaurantForm && (
                <Card>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">🏢 Meus Restaurantes</h2>
                  <p className="text-gray-600 mb-6">Você tem {adminRestaurants.length} restaurante(s) cadastrado(s)</p>
                  <p className="text-xs text-gray-600 mb-4">
                    Plano atual: <span className="font-semibold">{planLabels[activePlan]}</span> • Limite: <span className="font-semibold">{planLimitLabel(activeRule.maxRestaurants)}</span> restaurante(s)
                  </p>
                  <Button
                    onClick={() => setShowNewRestaurantForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    ➕ Cadastrar Novo Restaurante
                  </Button>
                </Card>
              )}

              {/* Formulário de Cadastro */}
              {showNewRestaurantForm && (
                <Card className="bg-blue-50 border-2 border-blue-300">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">📝 Cadastrar Novo Restaurante</h2>
                  
                  <div className="space-y-4">
                    <Input
                      label="Nome do Restaurante *"
                      placeholder="Ex: Hamburgueria do Centro"
                      value={newRestaurant.name}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                    />
                    <Input
                      label="Categoria *"
                      placeholder="Ex: Hambúrgueres, Pizzaria, Sushi..."
                      value={newRestaurant.category}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, category: e.target.value })}
                    />
                    <Input
                      label="Telefone"
                      placeholder="(11) 99999-9999"
                      value={newRestaurant.phone}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, phone: e.target.value })}
                    />
                    <Input
                      label="Endereço"
                      placeholder="Rua, número - Cidade, Estado"
                      value={newRestaurant.address}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                    />

                    {/* Comprovação */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        📋 Comprovação de Cadastro *
                      </label>
                      <p className="text-xs text-gray-600 mb-3">
                        Envie CNPJ, contrato de aluguel ou documento que comprove a atividade
                      </p>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                        onClick={() => {
                          setNewRestaurant({ ...newRestaurant, proof: 'Documento_CNPJ_01.pdf' });
                          alert('✅ Arquivo simulado: Documento_CNPJ_01.pdf');
                        }}
                      >
                        <p className="text-3xl mb-2">📄</p>
                        <p className="text-sm font-semibold text-gray-800">Clique para enviar comprovação</p>
                        <p className="text-xs text-gray-600 mt-1">PDF, JPG ou PNG (máx. 10MB)</p>
                        {newRestaurant.proof && (
                          <p className="text-xs text-green-600 mt-3 font-bold">✅ {newRestaurant.proof}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t-2 border-gray-200">
                    <Button
                      onClick={handleCreateRestaurant}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      ✅ Cadastrar Restaurante
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewRestaurantForm(false);
                        setNewRestaurant({ name: '', category: '', phone: '', address: '', proof: '' });
                      }}
                    >
                      ✕ Cancelar
                    </Button>
                  </div>
                </Card>
              )}

              {/* Lista de Restaurantes */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">📊 Restaurantes Cadastrados</h3>
                {adminRestaurants.map((rest) => (
                  <Card key={rest.id} className={editingRestaurantId === rest.id ? 'bg-orange-50 border-2 border-orange-300' : ''}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <span className="text-4xl">{rest.logo}</span>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800">{rest.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">📂 {rest.category}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-600">
                            <span>⭐ {rest.rating}</span>
                            <span>📍 {rest.distance}km</span>
                            <span>🚚 {rest.deliveryTime}min</span>
                            <span>💰 R${rest.minOrder}</span>
                          </div>
                          {editingRestaurantId === rest.id && (
                            <div className="mt-3 p-3 bg-orange-100 rounded text-xs text-orange-800 font-semibold">
                              🖊️ Modo de edição ativo
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRestaurant(rest.id)}
                          className={editingRestaurantId === rest.id ? 'bg-orange-500 text-white border-orange-500' : ''}
                        >
                          🖊️ Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRestaurant(rest.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          🗑️ Remover
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Editar Dados da Loja */}
              {editingRestaurantId && (
                <Card className="bg-orange-50 border-2 border-orange-300 mt-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">🏬 Dados da Loja - Edição</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nome da Loja"
                      placeholder="Meu Restaurante"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                    <Input
                      label="Telefone"
                      placeholder="(11) 99999-9999"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                    <Input
                      label="Endereço"
                      placeholder="Rua Example, 123"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    />
                    <Input
                      label="Categoria"
                      placeholder="Italiana, Brasileira..."
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6 pt-6 border-t-2 border-orange-300">
                    <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold">
                      💾 Salvar Alterações
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      ✕ Cancelar Edição
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Tab Integrações */}
          {activeTab === 'integracoes' && (
            <>
              <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🚀 Canais de Venda</h2>
                <p className="text-gray-600 mb-6">Ative os canais onde seu restaurante será exibido para aumentar visibilidade e vendas.</p>
                
                <div className="space-y-3">
                  {/* iFood */}
                  <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-3xl">🍔</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">iFood</h3>
                        <p className="text-sm text-gray-600">Principal plataforma de delivery do Brasil</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.ifood}
                      onChange={(e) => setChannels({ ...channels, ifood: e.target.checked })}
                      className="w-5 h-5 cursor-pointer"
                      style={{ accentColor: '#660000' }}
                    />
                  </div>

                  {/* Uber Eats */}
                  <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-3xl">🚗</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">Uber Eats</h3>
                        <p className="text-sm text-gray-600">Plataforma global de entrega de alimentos</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.uberEats}
                      onChange={(e) => setChannels({ ...channels, uberEats: e.target.checked })}
                      className="w-5 h-5 cursor-pointer"
                      style={{ accentColor: '#660000' }}
                    />
                  </div>

                  {/* Rappi */}
                  <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-3xl">📦</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">Rappi</h3>
                        <p className="text-sm text-gray-600">Marketplace de entregas latino-americano</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.rappi}
                      onChange={(e) => setChannels({ ...channels, rappi: e.target.checked })}
                      className="w-5 h-5 cursor-pointer"
                      style={{ accentColor: '#660000' }}
                    />
                  </div>

                  {/* 99Food */}
                  <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-3xl">🛵</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">99Food</h3>
                        <p className="text-sm text-gray-600">Plataforma de delivery do grupo 99</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.ninetyNineFood}
                      onChange={(e) => setChannels({ ...channels, ninetyNineFood: e.target.checked })}
                      className="w-5 h-5 cursor-pointer"
                      style={{ accentColor: '#660000' }}
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-gray-200">
                  <Button 
                    onClick={() => {
                      const enabledChannels = Object.entries(channels)
                        .filter(([, enabled]) => enabled)
                        .map(([channel]) => {
                          const labels: { [key: string]: string } = {
                            ifood: 'iFood',
                            uberEats: 'Uber Eats',
                            rappi: 'Rappi',
                            ninetyNineFood: '99Food'
                          };
                          return labels[channel] || channel;
                        })
                        .join(', ');
                      alert(`✅ Canais de venda atualizados: ${enabledChannels || 'nenhum'}`);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    💾 Salvar Canais de Venda
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
