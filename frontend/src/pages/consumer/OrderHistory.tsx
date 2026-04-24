import { Card, PageHeader } from '../../components/shared';

export default function OrderHistory() {
  const mockOrders = [
    {
      id: '1001',
      restaurant: 'Burger House',
      date: '15/04/2026 às 19:30',
      items: ['Hamburger Premium', 'Fritas'],
      total: 65.90,
      status: 'Entregue',
      image: '🍔'
    },
    {
      id: '1002',
      restaurant: 'Pizzaria do Bairro',
      date: '12/04/2026 às 20:15',
      items: ['Pizza Margarita (2 fatias)', 'Refrigerante 2L'],
      total: 54.50,
      status: 'Entregue',
      image: '🍕'
    },
    {
      id: '1003',
      restaurant: 'Sushi Express',
      date: '10/04/2026 às 12:45',
      items: ['Combo Sushi Mix', 'Sopa Miso'],
      total: 89.90,
      status: 'Entregue',
      image: '🍣'
    },
    {
      id: '1004',
      restaurant: 'Burger House',
      date: '08/04/2026 às 18:20',
      items: ['X-Salada', 'Milkshake Morango'],
      total: 42.80,
      status: 'Entregue',
      image: '🍔'
    },
    {
      id: '1005',
      restaurant: 'Restaurante Italiano',
      date: '05/04/2026 às 19:00',
      items: ['Pasta Carbonara', 'Tiramisú', 'Vinho tinto'],
      total: 125.00,
      status: 'Entregue',
      image: '🍝'
    },
    {
      id: '1006',
      restaurant: 'Açaí & Companhia',
      date: '01/04/2026 às 15:30',
      items: ['Açaí Premium', 'Granola extra'],
      total: 28.50,
      status: 'Entregue',
      image: '🍓'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregue':
        return 'text-green-600';
      case 'Cancelado':
        return 'text-red-600';
      case 'Em preparo':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Entregue':
        return 'bg-green-50';
      case 'Cancelado':
        return 'bg-red-50';
      case 'Em preparo':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Histórico de Pedidos" 
        subtitle="Veja todos os seus pedidos anteriores"
        icon="📜"
      />
      
      <div className="container mx-auto max-w-4xl px-4 py-6">
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <p className="text-sm text-gray-600 mb-1">Total de Pedidos</p>
            <p className="text-3xl font-bold" style={{ color: '#660000' }}>6</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Gasto Total</p>
            <p className="text-3xl font-bold" style={{ color: '#660000' }}>R$ 406,60</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
            <p className="text-3xl font-bold" style={{ color: '#660000' }}>R$ 67,77</p>
          </Card>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <Card key={order.id} className={`p-0 overflow-hidden border-l-4 ${getStatusBg(order.status)}`} style={{ borderLeftColor: '#660000' }}>
              <div className="p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-5xl">{order.image}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800">{order.restaurant}</h3>
                    <p className="text-sm text-gray-600 mb-2">📅 {order.date}</p>
                    <p className="text-sm text-gray-700">
                      <strong>Itens:</strong> {order.items.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold" style={{ color: '#660000' }}>R$ {order.total.toFixed(2)}</p>
                  <p className={`text-sm font-semibold mt-2 ${getStatusColor(order.status)}`}>✓ {order.status}</p>
                  <div className="mt-4 space-y-2">
                    <button className="block w-full text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition-colors">
                      📄 Detalhe
                    </button>
                    <button className="block w-full text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-medium transition-colors">
                      🔄 Repetir
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Informação */}
        <Card className="mt-8 bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-900">
            ℹ️ Você pode repetir pedidos anteriores ou visualizar detalhes de cada compra clicando nos botões.
          </p>
        </Card>
      </div>
    </div>
  );
}
