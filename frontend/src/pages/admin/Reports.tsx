import { Card, PageHeader } from '../../components/shared';

export default function Reports() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Relatórios" 
        subtitle="Análises e métricas detalhadas"
        icon="📈"
      />

      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-dark mb-4">Vendas por Canal</h2>
            <p className="text-dark/60">Gráfico de vendas por plataforma...</p>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold text-dark mb-4">Produtos Mais Vendidos</h2>
            <p className="text-dark/60">Ranking de produtos...</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
