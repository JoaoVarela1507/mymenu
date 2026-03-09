import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Input, Button, Badge, PageHeader } from '../../components/shared';
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
  const [activeTab, setActiveTab] = useState<'geral' | 'equipe' | 'integracoes'>('geral');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [headerColor, setHeaderColor] = useState('#C92924');

  useEffect(() => {
    if (tab && ['geral', 'equipe', 'integracoes'].includes(tab)) {
      setActiveTab(tab as 'geral' | 'equipe' | 'integracoes');
    }
  }, [tab]);

  useEffect(() => {
    if (restaurant?.headerColor) {
      setHeaderColor(restaurant.headerColor);
    }
  }, []);

  if (!user || user.type !== 'admin') return null;

  const restaurant = mockRestaurants.find(r => r.id === user.restaurantId);

  // Mock de colaboradores
  const mockStaff = [
    { id: 1, name: 'João Silva', email: 'joao@restaurante.com', status: 'active' },
    { id: 2, name: 'Maria Santos', email: 'maria@restaurante.com', status: 'pending' },
  ];

  const handleInvite = () => {
    console.log('Convidar:', { name: inviteName, email: inviteEmail });
    setInviteName('');
    setInviteEmail('');
  };

  const handleSaveSettings = () => {
    if (restaurant) {
      // Atualizar cor do header no mock
      const restaurantIndex = mockRestaurants.findIndex(r => r.id === restaurant.id);
      if (restaurantIndex !== -1) {
        mockRestaurants[restaurantIndex].headerColor = headerColor;
      }
      alert('✅ Configurações salvas com sucesso!');
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Configurações" 
        subtitle="Gerencie as informações do restaurante"
        icon="⚙️"
      />
      
      <div className="container mx-auto max-w-6xl px-4 py-6">

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-dark/10">
        <button
          onClick={() => setActiveTab('geral')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'geral'
              ? 'text-primary border-b-2 border-primary'
              : 'text-dark/60 hover:text-dark'
          }`}
        >
          Geral
        </button>
        <button
          onClick={() => setActiveTab('equipe')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'equipe'
              ? 'text-primary border-b-2 border-primary'
              : 'text-dark/60 hover:text-dark'
          }`}
        >
          Equipe
        </button>
        <button
          onClick={() => setActiveTab('integracoes')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'integracoes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-dark/60 hover:text-dark'
          }`}
        >
          Integrações
        </button>
      </div>

      <div className="space-y-6">
        {/* Tab Geral */}
        {activeTab === 'geral' && (
          <>
            {restaurant && (
              <Card>
                <h2 className="text-xl font-semibold text-dark mb-4">Plano Atual</h2>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-primary">
                      {planLabels[restaurant.plan]}
                    </span>
                    <Button variant="outline" size="sm">Alterar Plano</Button>
                  </div>
                  <p className="text-sm text-dark/70">{planDescriptions[restaurant.plan]}</p>
                </div>
                <div className="mt-4 text-xs text-dark/60">
                  <p>ℹ️ O plano define a prioridade do seu restaurante na listagem para os consumidores.</p>
                </div>
              </Card>
            )}

            <Card>
              <h2 className="text-xl font-semibold text-dark mb-4">Dados do Restaurante</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome do Restaurante" placeholder="Meu Restaurante" />
                <Input label="Telefone" placeholder="(11) 99999-9999" />
                <Input label="Endereço" placeholder="Rua Example, 123" />
                <Input label="Categoria" placeholder="Italiana, Brasileira..." />
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-dark mb-2">
                  Cor do Header da Página
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="h-12 w-24 rounded-lg border-2 border-dark/20 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={headerColor}
                      onChange={(e) => setHeaderColor(e.target.value)}
                      placeholder="#C92924"
                    />
                  </div>
                  <div 
                    className="h-12 w-32 rounded-lg border-2 border-dark/20 flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: headerColor }}
                  >
                    Preview
                  </div>
                </div>
                <p className="text-xs text-dark/60 mt-2">
                  ℹ️ Esta cor será exibida no topo da página do seu restaurante
                </p>
              </div>
              
              <div className="mt-4">
                <Button variant="primary" onClick={handleSaveSettings}>Salvar Alterações</Button>
              </div>
            </Card>
          </>
        )}

        {/* Tab Equipe */}
        {activeTab === 'equipe' && (
          <>
            <Card>
              <h2 className="text-xl font-semibold text-dark mb-4">Convidar Colaborador</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nome do colaborador"
                />
                <Input
                  label="Email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@restaurante.com"
                />
              </div>
              <div className="mt-4">
                <Button variant="primary" onClick={handleInvite}>
                  Enviar Convite
                </Button>
              </div>
              <p className="text-xs text-dark/60 mt-2">
                ℹ️ O colaborador receberá um email para definir a senha no primeiro acesso
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-dark mb-4">Colaboradores</h2>
              <div className="space-y-3">
                {mockStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-medium text-dark">{staff.name}</p>
                      <p className="text-sm text-dark/60">{staff.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={staff.status === 'active' ? 'confirmado' : 'pendente'}>
                        {staff.status === 'active' ? 'Ativo' : 'Convite Pendente'}
                      </Badge>
                      <Button variant="outline" size="sm">Remover</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Tab Integrações */}
        {activeTab === 'integracoes' && (
          <Card>
            <h2 className="text-xl font-semibold text-dark mb-4">Integrações</h2>
            <p className="text-dark/60">Conecte seu restaurante com iFood, Uber Eats e Rappi...</p>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
