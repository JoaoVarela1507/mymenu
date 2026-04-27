import { useState } from 'react';
import { Card, Button, Input, PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Helena Souza',
    email: user?.email || 'helena@email.com',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123, Apto 456 - São Paulo, SP',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    setIsEditing(false);
    alert('✅ Perfil atualizado com sucesso!');
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword) {
      alert('❌ Digite sua senha atual');
      return;
    }
    if (!passwordData.newPassword) {
      alert('❌ Digite uma nova senha');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ As senhas não coincidem');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('❌ A senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsChangingPassword(false);
    alert('✅ Senha alterada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações pessoais"
        icon="👤"
      />
      
      <div className="container mx-auto max-w-3xl px-4 py-6">
        {/* Avatar e Info Rápida */}
        <Card className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center text-5xl">
              👩
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{formData.name}</h2>
              <p className="text-gray-600 mb-1">📧 {formData.email}</p>
              <p className="text-gray-600">📱 {formData.phone}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {!isEditing && (
              <Button 
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Editar Perfil
              </Button>
            )}
          </div>
        </Card>

        {/* Formulário de Edição */}
        {isEditing && (
          <Card className="mb-8 bg-blue-50">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Editar Informações</h3>
            <div className="space-y-4">
              <Input
                label="Nome Completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Endereço"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="primary"
                  onClick={handleSave}
                >
                  💾 Salvar Alterações
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  ✕ Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Seções de Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">📍 Endereço</h3>
            <p className="text-gray-700 mb-4">{formData.address}</p>
            <Button variant="outline" size="sm">Alterar Endereço</Button>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">🔒 Segurança</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">Gerencie sua senha e segurança</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
              >
                {isChangingPassword ? '✕ Cancelar' : '🔑 Alterar Senha'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Alterar Senha */}
        {isChangingPassword && (
          <Card className="mt-6 bg-red-50 border-l-4 border-red-400">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🔐 Alterar Senha</h3>
            <div className="space-y-4">
              <Input
                label="Senha Atual"
                type="password"
                placeholder="Digite sua senha atual"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <Input
                label="Nova Senha"
                type="password"
                placeholder="Digite uma nova senha"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <Input
                label="Confirmar Nova Senha"
                type="password"
                placeholder="Confirme a nova senha"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleChangePassword}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  💾 Salvar Nova Senha
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  ✕ Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Preferências */}
        <Card className="mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ Preferências</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-700">Receber notificações de ofertas</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-700">Receber notificações de novos restaurantes</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-700">Compartilhar histórico de pedidos</span>
            </label>
          </div>
        </Card>

        {/* Dados da Conta */}
        <Card className="mt-6 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Estatísticas</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: '#660000' }}>24</p>
              <p className="text-xs text-gray-600 mt-1">Pedidos Realizados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: '#660000' }}>R$ 1.240</p>
              <p className="text-xs text-gray-600 mt-1">Total Gasto</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: '#660000' }}>8</p>
              <p className="text-xs text-gray-600 mt-1">Restaurantes Favoritos</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
