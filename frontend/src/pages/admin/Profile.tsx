import { Card, Input, Button, PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { mockRestaurants } from '../../lib/mockRestaurants';
import { useState, useEffect } from 'react';

export default function Profile() {
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
  }, [selectedRestaurantId, adminRestaurants]);

  if (!user) return null;

  const selectedRestaurant = adminRestaurants.find(r => r.id === selectedRestaurantId);

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações pessoais"
        icon="👤"
      />
      
      <div className="container mx-auto max-w-6xl px-4 py-6">

      <div className="max-w-2xl">
        <Card>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dark/10">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-secondary text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-dark">{user.name}</h2>
              <p className="text-dark/60 text-sm">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-primary text-secondary text-xs rounded-full">
                {user.type === 'admin' ? 'Administrador' : user.type === 'staff' ? 'Funcionário' : 'Consumidor'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Nome Completo" defaultValue={user.name} />
            <Input label="Email" type="email" defaultValue={user.email} />
            <Input label="Telefone" placeholder="(11) 99999-9999" />
            
            {/* Seletor de Restaurante */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Restaurante Gerenciado</label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full px-3 py-2 border border-dark/20 rounded-lg text-sm font-medium bg-white cursor-pointer hover:border-dark/40"
              >
                {adminRestaurants.map(rest => (
                  <option key={rest.id} value={rest.id}>
                    {rest.logo} {rest.name}
                  </option>
                ))}
              </select>
              {selectedRestaurant && (
                <p className="text-xs text-dark/60 mt-2">
                  Categoria: {selectedRestaurant.category} • Avaliação: ⭐ {selectedRestaurant.rating}
                </p>
              )}
            </div>
            
            <div className="pt-4">
              <Button variant="primary">Salvar Alterações</Button>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-dark mb-4">Alterar Senha</h3>
          <div className="space-y-4">
            <Input label="Senha Atual" type="password" />
            <Input label="Nova Senha" type="password" />
            <Input label="Confirmar Nova Senha" type="password" />
            
            <div className="pt-2">
              <Button variant="outline">Alterar Senha</Button>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
