import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Input, Button, PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { mockRestaurants } from '../../lib/mockRestaurants';

const planLabels = {
  diamante: '💎 Diamante',
  ouro: '🥇 Ouro',
  prata: '🥈 Prata',
  basico: '🎯 Básico',
};

const planDescriptions = {
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

  const restaurant = adminRestaurants.find(r => r.id === selectedRestaurantId);

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
                <Card>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Plano Atual</h2>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#fff3cd' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold" style={{ color: '#660000' }}>
                        {planLabels[restaurant.plan]}
                      </span>
                      <Button variant="outline" size="sm">Alterar Plano</Button>
                    </div>
                    <p className="text-sm text-gray-700">{planDescriptions[restaurant.plan]}</p>
                  </div>
                  <div className="mt-4 text-xs text-gray-600">
                    <p>ℹ️ O plano define a prioridade do seu restaurante na listagem para os consumidores.</p>
                  </div>
                </Card>
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
