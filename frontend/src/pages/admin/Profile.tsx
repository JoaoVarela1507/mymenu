import { Card, Input, Button, PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;
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
