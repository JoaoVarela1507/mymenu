import { useState } from 'react';
import type { Order, OrderStatus, OrderSource } from '../../types';
import { mockOrders } from '../../lib/mockData';
import OrderCard from '../../components/admin/OrderCard';
import { EmptyState, PageHeader, FilterButton } from '../../components/shared';

type SortOption = 'newest' | 'oldest';

export default function OrdersCenter() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchId, setSearchId] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<OrderSource | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setFilter('all');
    setSourceFilter('all');
    setSortBy('newest');
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // Filtrar e ordenar pedidos
  const filteredAndSortedOrders = orders
    .filter(order => {
      // Filtro por ID
      if (searchId && !order.orderNumber.toLowerCase().includes(searchId.toLowerCase())) {
        return false;
      }
      // Filtro por status
      if (filter !== 'all' && order.status !== filter) {
        return false;
      }
      // Filtro por fonte
      if (sourceFilter !== 'all' && order.source !== sourceFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.createdAt.localeCompare(b.createdAt);
        case 'newest':
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

  const statusCounts = {
    novo: orders.filter(o => o.status === 'novo').length,
    aceito: orders.filter(o => o.status === 'aceito').length,
    preparo: orders.filter(o => o.status === 'preparo').length,
    pronto: orders.filter(o => o.status === 'pronto').length,
  };

  const sourceCounts = {
    ifood: orders.filter(o => o.source === 'ifood').length,
    ubereats: orders.filter(o => o.source === 'ubereats').length,
    rappi: orders.filter(o => o.source === 'rappi').length,
  };

  const activeFiltersCount = [
    filter !== 'all' ? 1 : 0,
    sourceFilter !== 'all' ? 1 : 0,
    sortBy !== 'newest' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Central de Pedidos" 
        subtitle="Gerencie todos os pedidos em tempo real"
        icon="📋"
      />
      
      <div className="container mx-auto max-w-6xl px-4 py-4">
        {/* Barra de Busca e Filtros */}
        <div className="flex gap-3 mb-4">
          {/* Campo de Busca */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por número do pedido..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full px-3 py-2 border border-dark/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-[42px]"
            />
          </div>
          
          <FilterButton
            activeFiltersCount={activeFiltersCount}
            showFilters={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
            onClearFilters={clearFilters}
            variant="primary"
          >
            {/* Status */}
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-dark mb-2">Status:</h3>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    filter === 'all' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('novo')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    filter === 'novo' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  Novos ({statusCounts.novo})
                </button>
                <button
                  onClick={() => setFilter('aceito')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    filter === 'aceito' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  Aceitos ({statusCounts.aceito})
                </button>
                <button
                  onClick={() => setFilter('preparo')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    filter === 'preparo' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  Preparo ({statusCounts.preparo})
                </button>
                <button
                  onClick={() => setFilter('pronto')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    filter === 'pronto' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  Prontos ({statusCounts.pronto})
                </button>
              </div>
            </div>

            {/* Plataforma */}
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-dark mb-2">Plataforma:</h3>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSourceFilter('all')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    sourceFilter === 'all' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setSourceFilter('ifood')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    sourceFilter === 'ifood' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  🍔 iFood ({sourceCounts.ifood})
                </button>
                <button
                  onClick={() => setSourceFilter('ubereats')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    sourceFilter === 'ubereats' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  🚗 Uber ({sourceCounts.ubereats})
                </button>
                <button
                  onClick={() => setSourceFilter('rappi')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    sourceFilter === 'rappi' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  ⚡ Rappi ({sourceCounts.rappi})
                </button>
              </div>
            </div>

            {/* Ordenação */}
            <div>
              <h3 className="text-xs font-semibold text-dark mb-2">Ordenar:</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    sortBy === 'newest' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  Recentes
                </button>
                <button
                  onClick={() => setSortBy('oldest')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    sortBy === 'oldest' ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                  }`}
                >
                  Antigos
                </button>
              </div>
            </div>
          </FilterButton>
        </div>

        {/* Lista de Pedidos - Layout Vertical com Animações */}
        <div className="space-y-2">
          {filteredAndSortedOrders.length === 0 ? (
            <EmptyState 
              message={searchId ? 'Nenhum pedido encontrado para esta busca' : 'Nenhum pedido encontrado'}
              icon="📦"
            />
          ) : (
            filteredAndSortedOrders.map((order, index) => (
              <div 
                key={order.id} 
                className="animate-slide-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <OrderCard 
                  order={order} 
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
