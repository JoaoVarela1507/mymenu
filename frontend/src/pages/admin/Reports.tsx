import { Card, PageHeader } from '../../components/shared';

export default function Reports() {
  // Mock data para gráficos
  const monthlySalesData = [
    { month: 'Jan', sales: 4200, orders: 24 },
    { month: 'Fev', sales: 5100, orders: 32 },
    { month: 'Mar', sales: 4800, orders: 28 },
    { month: 'Abr', sales: 6200, orders: 42 },
    { month: 'Mai', sales: 7100, orders: 48 },
    { month: 'Jun', sales: 6800, orders: 45 },
  ];

  const topDishes = [
    { name: 'Hamburger Premium', sales: 245, revenue: 3675 },
    { name: 'Pizza Margarita', sales: 198, revenue: 2970 },
    { name: 'Fritas Premium', sales: 187, revenue: 1121 },
    { name: 'Refrigerante 2L', sales: 156, revenue: 624 },
    { name: 'Sobremesa', sales: 98, revenue: 980 },
  ];

  // Calcular máximos para normalizar os gráficos
  const maxSales = Math.max(...monthlySalesData.map(d => d.sales));
  const maxDishSales = Math.max(...topDishes.map(d => d.sales));

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>
      <PageHeader 
        title="Relatórios" 
        subtitle="Análises detalhadas de vendas e performance"
        icon="📊"
      />
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* KPIs de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-l-4" style={{ borderLeftColor: '#660000' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Faturamento (Mês)</p>
                <p className="text-3xl font-bold" style={{ color: '#660000' }}>R$ 23.840</p>
                <p className="text-xs text-green-600 mt-2 font-semibold">↑ 15% vs anterior</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#660000' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Pedidos (Mês)</p>
                <p className="text-3xl font-bold" style={{ color: '#660000' }}>219</p>
                <p className="text-xs text-green-600 mt-2 font-semibold">↑ 8% vs anterior</p>
              </div>
              <span className="text-3xl">📦</span>
            </div>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#660000' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Ticket Médio</p>
                <p className="text-3xl font-bold" style={{ color: '#660000' }}>R$ 108,90</p>
                <p className="text-xs text-gray-500 mt-2">Estável</p>
              </div>
              <span className="text-3xl">💳</span>
            </div>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#660000' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Taxa Conversão</p>
                <p className="text-3xl font-bold" style={{ color: '#660000' }}>3.2%</p>
                <p className="text-xs text-red-600 mt-2 font-semibold">↓ 0.5% vs anterior</p>
              </div>
              <span className="text-3xl">📈</span>
            </div>
          </Card>
        </div>

        {/* Gráfico de Vendas Mensais */}
        <Card className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b-2" style={{ borderBottomColor: '#660000', color: '#660000' }}>
            📊 Vendas Mensais (Últimos 6 Meses)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Gráfico */}
            <div className="space-y-3">
              {monthlySalesData.map((item) => (
                <div key={item.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800 w-12">{item.month}</span>
                    <span className="text-sm text-gray-600">R$ {item.sales}</span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-300"
                      style={{
                        width: `${(item.sales / maxSales) * 100}%`,
                        backgroundColor: '#660000'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Resumo do Período</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-700">Total</span>
                  <p className="text-2xl font-bold" style={{ color: '#660000' }}>R$ 36.300</p>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-700">Média Mensal</span>
                  <p className="text-2xl font-bold" style={{ color: '#660000' }}>R$ 6.050</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total de Pedidos</span>
                  <p className="text-2xl font-bold" style={{ color: '#660000' }}>219</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-6 text-center">Variação positiva nas últimas semanas</p>
            </div>
          </div>
        </Card>

        {/* Pratos Mais Vendidos */}
        <Card className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b-2" style={{ borderBottomColor: '#660000', color: '#660000' }}>
            🍽️ Pratos Mais Vendidos
          </h2>
          
          <div className="space-y-5">
            {topDishes.map((dish, index) => {
              const discount = ((dish.sales / maxDishSales) * 100).toFixed(0);
              return (
                <div key={dish.name} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#660000' }}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-800">{dish.name}</p>
                      <p className="text-sm text-gray-600">{dish.sales} vendas</p>
                    </div>
                    <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${discount}%`,
                          backgroundColor: '#660000'
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Faturamento: R$ {dish.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 border-t-4 border-blue-400">
            <p className="text-lg font-bold text-blue-900 mb-2">📈 Crescimento</p>
            <p className="text-sm text-blue-800">Suas vendas cresceram 15% este mês. Excelente performance!</p>
          </Card>
          <Card className="bg-yellow-50 border-t-4 border-yellow-400">
            <p className="text-lg font-bold text-yellow-900 mb-2">⭐ Produto Destaque</p>
            <p className="text-sm text-yellow-800">Hamburger Premium lidera vendas. Considere promovê-lo mais.</p>
          </Card>
          <Card className="bg-green-50 border-t-4 border-green-400">
            <p className="text-lg font-bold text-green-900 mb-2">🎯 Ticket Ótimo</p>
            <p className="text-sm text-green-800">R$ 108,90 está acima da média. Continue essa estratégia!</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
