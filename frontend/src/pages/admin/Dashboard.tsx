import { Card, PageHeader } from '../../components/shared';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Dashboard" 
        subtitle="Visão geral do seu restaurante"
        icon="📊"
      />

      <div className="container mx-auto max-w-6xl px-4 py-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-sm text-dark/60 mb-1">Pedidos Hoje</p>
          <p className="text-3xl font-bold text-primary">24</p>
        </Card>
        <Card>
          <p className="text-sm text-dark/60 mb-1">Faturamento</p>
          <p className="text-3xl font-bold text-primary">R$ 1.240</p>
        </Card>
        <Card>
          <p className="text-sm text-dark/60 mb-1">Ticket Médio</p>
          <p className="text-3xl font-bold text-primary">R$ 51,67</p>
        </Card>
        <Card>
          <p className="text-sm text-dark/60 mb-1">Avaliação</p>
          <p className="text-3xl font-bold text-primary">4.8 ⭐</p>
        </Card>
      </div>

        <Card>
          <h2 className="text-xl font-semibold text-dark mb-4">Atividade Recente</h2>
          <p className="text-dark/60">Gráficos e métricas detalhadas virão aqui...</p>
        </Card>
      </div>
    </div>
  );
}
