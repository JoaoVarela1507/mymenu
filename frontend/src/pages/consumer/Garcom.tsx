import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  getDiamondRestaurants, getTableByCode, getCategories, getMenuItems, submitTableOrder,
} from '../../lib/firestoreService';
import type { Restaurant, MenuItem, MenuCategory } from '../../types/restaurant';
import type { TableOrderItem, TableOrder } from '../../lib/firestoreService';

type CartItem = TableOrderItem & { categoryId?: string };

function codeValid(code: string) {
  return /^[A-Za-z]{3}-\d{3}$/.test(code);
}

function statusLabel(s: TableOrder['status']) {
  const map: Record<string, string> = {
    pending: '⏳ Aguardando',
    aceito: '✅ Aceito pelo restaurante',
    preparing: '👨‍🍳 Em preparo',
    delivered: '🛎️ Pronto para entrega',
    finalizado: '✅ Finalizado',
    cancelled: '❌ Cancelado',
  };
  return map[s] ?? s;
}

export default function Garcom() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<'select' | 'code' | 'menu' | 'sent'>('select');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRests, setLoadingRests] = useState(true);
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);
  const [search, setSearch] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [tableInfo, setTableInfo] = useState<{ id: string; name: string; code: string } | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pastOrders, setPastOrders] = useState<TableOrder[]>([]);

  useEffect(() => {
    getDiamondRestaurants().then(r => { setRestaurants(r); setLoadingRests(false); });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const q = query(collection(db, 'tableOrders'), where('userId', '==', user.id));
    const unsub = onSnapshot(q, snap => {
      const orders = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as TableOrder))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setPastOrders(orders);
    });
    return unsub;
  }, [user?.id]);

  const handleSelectRest = (r: Restaurant) => {
    setSelectedRest(r);
    setStep('code');
    setCode('');
    setCodeError('');
  };

  const handleValidateCode = async () => {
    if (!codeValid(code)) { setCodeError('Formato inválido. Use 3 letras + 3 números (ex: FSD-456)'); return; }
    setValidatingCode(true);
    setCodeError('');
    const table = await getTableByCode(selectedRest!.id, code);
    if (!table) { setCodeError('Código não encontrado. Verifique e tente novamente.'); setValidatingCode(false); return; }
    setTableInfo({ id: table.id, name: table.name, code: table.code });
    const [cats, items] = await Promise.all([getCategories(selectedRest!.id), getMenuItems(selectedRest!.id)]);
    setCategories(cats);
    setMenuItems(items.filter(i => i.available));
    setCart([]);
    setStep('menu');
    setValidatingCode(false);
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === item.id);
      if (existing) return prev.map(c => c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      const price = item.isOffer && item.offerPrice ? item.offerPrice : item.price;
      return [...prev, { itemId: item.id, name: item.name, price, quantity: 1, image: item.image }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.itemId === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter(c => c.itemId !== itemId);
      return prev.map(c => c.itemId === itemId ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0 || !selectedRest || !tableInfo || !user) return;
    setSubmitting(true);
    await submitTableOrder({
      restaurantId: selectedRest.id,
      restaurantName: selectedRest.name,
      tableId: tableInfo.id,
      tableCode: tableInfo.code,
      tableName: tableInfo.name,
      userId: user.id,
      items: cart,
      total: cartTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    setStep('sent');
    setSubmitting(false);
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Garçom" subtitle="Peça direto da mesa" icon="🍽️" />
      <div className="container mx-auto max-w-md px-4 py-16 text-center text-gray-400">
        <p className="text-4xl mb-4">🔒</p>
        <p className="font-semibold">Faça login para usar esta funcionalidade.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Garçom" subtitle="Peça direto da mesa, sem esperar" icon="🍽️" />

      <div className="container mx-auto max-w-3xl px-4 py-6">

        {/* ── Selecionar restaurante ── */}
        {step === 'select' && (
          <div className="space-y-4">
            {/* Campo de busca com autocomplete */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Restaurante
              </label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Digite o nome do restaurante..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#C92924] transition-colors"
                disabled={loadingRests}
              />
              {loadingRests && (
                <p className="text-xs text-gray-400 mt-1">Carregando restaurantes...</p>
              )}

              {/* Lista de sugestões */}
              {!loadingRests && search.trim().length > 0 && (() => {
                const filtered = restaurants
                  .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
                  .sort((a, b) => a.name.localeCompare(b.name));
                return filtered.length > 0 ? (
                  <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border-2 border-[#e8d9b5] rounded-xl shadow-lg overflow-hidden">
                    {filtered.map(r => (
                      <li key={r.id}>
                        <button
                          onClick={() => { handleSelectRest(r); setSearch(''); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fdf6ec] transition-colors text-left"
                        >
                          <span className="text-2xl">{r.logo}</span>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                            <p className="text-xs text-gray-500">{r.city || r.category}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border-2 border-[#e8d9b5] rounded-xl shadow-lg px-4 py-3">
                    <p className="text-sm text-gray-400">Nenhum restaurante encontrado.</p>
                  </div>
                );
              })()}
            </div>

            {/* Todos os restaurantes (quando campo vazio) */}
            {!loadingRests && search.trim().length === 0 && restaurants.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">💎</p>
                <p className="text-sm">Nenhum restaurante com Pedido na Mesa disponível no momento.</p>
              </div>
            )}

            {pastOrders.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold text-gray-700 mb-3">Meus pedidos anteriores</p>
                <div className="space-y-2">
                  {pastOrders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl text-sm">
                      <div>
                        <p className="font-semibold text-gray-800">{o.restaurantName} · {o.tableName}</p>
                        <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('pt-BR')} · {o.items.length} {o.items.length === 1 ? 'item' : 'itens'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#660000]">R$ {o.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{statusLabel(o.status)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Inserir código da mesa ── */}
        {step === 'code' && (
          <div className="max-w-sm mx-auto space-y-4">
            <button onClick={() => setStep('select')} className="text-sm text-[#660000] hover:underline flex items-center gap-1">← Voltar</button>
            <div className="flex items-center gap-3 p-3 bg-[#fdf6ec] border border-[#e8d9b5] rounded-xl">
              <span className="text-2xl">{selectedRest?.logo}</span>
              <p className="font-bold text-gray-800">{selectedRest?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Código da Mesa</label>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError(''); }}
                placeholder="EX: FSD-456"
                maxLength={7}
                className="w-full px-4 py-3 text-center text-xl font-mono font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#C92924] tracking-widest"
              />
              <p className="text-xs text-gray-400 mt-1 text-center">3 letras + 3 números (código na sua mesa)</p>
              {codeError && <p className="text-xs text-red-600 mt-1">{codeError}</p>}
            </div>
            <button
              onClick={handleValidateCode}
              disabled={validatingCode || code.length < 7}
              className="w-full py-3 bg-[#660000] text-white font-bold rounded-xl hover:bg-[#550000] transition-colors disabled:opacity-50"
            >
              {validatingCode ? 'Verificando...' : 'Acessar Cardápio'}
            </button>
          </div>
        )}

        {/* ── Cardápio + carrinho ── */}
        {step === 'menu' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setStep('select')} className="text-sm text-[#660000] hover:underline flex items-center gap-1">← Sair</button>
              <div className="text-center">
                <p className="font-bold text-gray-800">{selectedRest?.name}</p>
                <p className="text-xs text-gray-500">🪑 {tableInfo?.name} · {tableInfo?.code}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Carrinho</p>
                <p className="font-bold text-[#660000]">{cartCount} itens</p>
              </div>
            </div>

            <div className="space-y-6 mb-32">
              {categories.map(cat => {
                const items = menuItems.filter(i => i.categoryId === cat.id);
                if (!items.length) return null;
                return (
                  <div key={cat.id}>
                    <p className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">{cat.name}</p>
                    <div className="space-y-2">
                      {items.map(item => {
                        const inCart = cart.find(c => c.itemId === item.id);
                        const price = item.isOffer && item.offerPrice ? item.offerPrice : item.price;
                        return (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                            <span className="text-3xl">{item.image || '🍽️'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                              {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
                              <p className="text-sm font-bold text-[#C92924] mt-0.5">R$ {price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {inCart ? (
                                <>
                                  <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700">−</button>
                                  <span className="w-5 text-center font-bold text-sm">{inCart.quantity}</span>
                                  <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-full bg-[#660000] hover:bg-[#550000] flex items-center justify-center font-bold text-white">+</button>
                                </>
                              ) : (
                                <button onClick={() => addToCart(item)} className="px-3 py-1.5 bg-[#660000] text-white text-xs font-bold rounded-lg hover:bg-[#550000] transition-colors">+ Adicionar</button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {cart.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#e8d9b5] p-4 z-20 lg:left-56">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</p>
                    <p className="text-lg font-bold text-[#660000]">R$ {cartTotal.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="flex-1 max-w-xs py-3 bg-[#660000] text-white font-bold rounded-xl hover:bg-[#550000] transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : '🛎️ Enviar para a Cozinha'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Pedido enviado ── */}
        {step === 'sent' && (
          <div className="text-center py-10">
            <p className="text-5xl mb-4">🎉</p>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Pedido enviado!</h3>
            <p className="text-sm text-gray-600 mb-1">Seu pedido foi enviado para a cozinha do <strong>{selectedRest?.name}</strong>.</p>
            <p className="text-sm text-gray-500 mb-6">Mesa: {tableInfo?.name} · {tableInfo?.code}</p>
            <button onClick={() => { setStep('select'); setCart([]); }} className="px-6 py-2.5 bg-[#660000] text-white font-bold rounded-xl hover:bg-[#550000] transition-colors text-sm">
              Fazer outro pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
