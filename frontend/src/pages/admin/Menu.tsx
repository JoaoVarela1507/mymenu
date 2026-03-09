import { Card, Button, PageHeader } from '../../components/shared';

export default function Menu() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Gestão de Cardápio" 
        subtitle="Gerencie categorias e produtos"
        icon="📝"
      />
      
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="flex justify-end mb-6">
          <Button variant="primary">+ Novo Produto</Button>
        </div>

        <Card>
          <p className="text-dark/60">Interface de gestão de cardápio virá aqui...</p>
        </Card>
      </div>
    </div>
  );
}
