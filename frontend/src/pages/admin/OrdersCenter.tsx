import { useState, useEffect } from 'react';
import type { Order, OrderStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { TableOrder } from '../../lib/firestoreService';
import OrderCard from '../../components/admin/OrderCard';
import { EmptyState, PageHeader, FilterButton } from '../../components/shared';

type SortOption = 'newest' | 'oldest';

const TO_DISPLAY: Record<string, OrderStatus> = {
  pending: 'novo',
  aceito: 'aceito',
  preparing: 'preparo',
  delivered: 'pronto',
  finalizado: 'finalizado',
  cancelled: 'cancelado',
};

const TO_FIRESTORE: Record<OrderStatus, TableOrder['status']> = {
  novo: 'pending',
  aceito: 'aceito',
  preparo: 'preparing',
  pronto: 'delivered',
  finalizado: 'finalizado',
  cancelado: 'cancelled',
};

function mapToOrder(t: TableOrder, index: number): Order {
  let time = t.createdAt;
  try {
    const d = new Date(t.createdAt);
    if (!isNaN(d.getTime())) {
      time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  } catch (_) {}

  return {
    id: t.id,
    orderNumber: `#${String(index + 1).padStart(3, '0')}`,
    tableNumber: 0,
    tableName: t.tableName,
    tableCode: t.tableCode,
    status: TO_DISPLAY[t.status] ?? 'novo',
    items: t.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
    total: t.total,
    createdAt: time,
  };
}

export default function OrdersCenter() {
  const { user } = useAuth();
  const [tableOrders, setTableOrders] = useState<TableOrder[]>([]);
  const [searchId, setSearchId] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const restaurantId = user?.id ?? '';

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(collection(db, 'tableOrders'), where('restaurantId', '==', restaurantId));
    const unsub = onSnapshot(q, snap => {
      const orders = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as TableOrder))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setTableOrders(orders);
    });
    return unsub;
  }, [restaurantId]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateDoc(doc(db, 'tableOrders', orderId), { status: TO_FIRESTORE[newStatus] });
  };

  // Stable sequential numbers based on creation order (oldest = #001)
  const chronological = [...tableOrders].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const indexMap = new Map(chronological.map((o, i) => [o.id, i]));
  const orders: Order[] = tableOrders.map(t => mapToOrder(t, indexMap.get(t.id) ?? 0));

  const clearFilters = () => { setFilter('all'); setSortBy('newest'); };

  const filteredOrders = orders
    .filter(order => {
      if (searchId) {
        const q = searchId.toLowerCase();
        const matchesNum = order.orderNumber.toLowerCase().includes(q);
        const matchesTable = (order.tableName ?? '').toLowerCase().includes(q) ||
                             (order.tableCode ?? '').toLowerCase().includes(q);
        if (!matchesNum && !matchesTable) return false;
      }
      if (filter !== 'all' && order.status !== filter) return false;
      return true;
    })
    .sort((a, b) => sortBy === 'oldest'
      ? a.createdAt.localeCompare(b.createdAt)
      : b.createdAt.localeCompare(a.createdAt)
    );

  const statusCounts = {
    novo: orders.filter(o => o.status === 'novo').length,
    aceito: orders.filter(o => o.status === 'aceito').length,
    preparo: orders.filter(o => o.status === 'preparo').length,
    pronto: orders.filter(o => o.status === 'pronto').length,
  };

  const activeFiltersCount = (filter !== 'all' ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Central de Pedidos"
        subtitle="Gerencie os pedidos do restaurante em tempo real"
        icon="📋"
      />

      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por pedido ou mesa..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              className="w-full px-3 py-2 border border-dark/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-[42px]"
            />
          </div>

          <FilterButton
            activeFiltersCount={activeFiltersCount}
            showFilters={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
            onClearFilters={clearFilters}
          >
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-dark mb-2">Status:</h3>
              <div className="flex flex-wrap gap-1">
                {([
                  ['all', 'Todos'],
                  ['novo', `Novos (${statusCounts.novo})`],
                  ['aceito', `Aceitos (${statusCounts.aceito})`],
                  ['preparo', `Preparo (${statusCounts.preparo})`],
                  ['pronto', `Prontos (${statusCounts.pronto})`],
                ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilter(val)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      filter === val ? 'bg-primary text-secondary' : 'bg-secondary text-dark hover:bg-secondary/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

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

        <div className="space-y-2">
          {filteredOrders.length === 0 ? (
            <EmptyState
              message={searchId ? 'Nenhum pedido encontrado para esta busca' : 'Nenhum pedido de mesa registrado ainda'}
              icon="📦"
            />
          ) : (
            filteredOrders.map((order, index) => (
              <div key={order.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <OrderCard order={order} onStatusChange={handleStatusChange} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
