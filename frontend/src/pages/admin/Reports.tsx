import { Card, PageHeader } from '../../components/shared';

export default function Reports() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      <PageHeader
        title="Relatórios"
        subtitle="Análises de vendas e performance"
        icon="📊"
      />

      <div className="max-w-3xl mx-auto px-8 py-16 text-center">
        <div className="text-7xl mb-6">📂</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Relatórios em breve</h2>
        <p className="text-gray-600 mb-2">
          Esta funcionalidade estará disponível em breve.
        </p>
        <p className="text-gray-500 text-sm">
          Você poderá importar uma planilha Excel com seus dados de vendas para visualizar relatórios detalhados de faturamento, pedidos e performance por prato.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <Card className="opacity-50">
            <p className="text-2xl mb-2">💰</p>
            <p className="font-bold text-gray-700">Faturamento</p>
            <p className="text-sm text-gray-500 mt-1">Receita total, média diária e por período</p>
          </Card>
          <Card className="opacity-50">
            <p className="text-2xl mb-2">📦</p>
            <p className="font-bold text-gray-700">Pedidos</p>
            <p className="text-sm text-gray-500 mt-1">Volume de pedidos, ticket médio e tendências</p>
          </Card>
          <Card className="opacity-50">
            <p className="text-2xl mb-2">🍽️</p>
            <p className="font-bold text-gray-700">Pratos</p>
            <p className="text-sm text-gray-500 mt-1">Itens mais vendidos e maior faturamento</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
