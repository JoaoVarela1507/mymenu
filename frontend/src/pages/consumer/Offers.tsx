import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../../components/shared';
import { getAllPromotions, getRestaurants, getAllOfferItems } from '../../lib/firestoreService';
import type { Promotion, PromotionDay } from '../../types';
import type { Restaurant, MenuItem } from '../../types/restaurant';
import { useAuth } from '../../contexts/AuthContext';

const DAY_SHORT: Record<PromotionDay, string> = {
  seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb', dom: 'Dom',
};

const JS_DAY_MAP: PromotionDay[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

function isTodayActive(days: PromotionDay[]): boolean {
  return days.includes(JS_DAY_MAP[new Date().getDay()]);
}

export default function Offers() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allPromos, setAllPromos] = useState<(Promotion & { restaurant?: Restaurant })[]>([]);
  const [offerItems, setOfferItems] = useState<(MenuItem & { restaurant?: Restaurant })[]>([]);

  useEffect(() => {
    Promise.all([getAllPromotions(), getRestaurants(), getAllOfferItems()]).then(([promos, rests, items]) => {
      const mappedPromos = promos
        .map(p => ({ ...p, restaurant: rests.find(r => r.id === p.restaurantId) }))
        .filter(p => p.restaurant);

      const mappedItems = items
        .filter(i => i.available)
        .map(i => ({ ...i, restaurant: rests.find(r => r.id === i.restaurantId) }))
        .filter(i => i.restaurant);

      setAllPromos(mappedPromos);
      setOfferItems(mappedItems);
      setLoading(false);
    });
  }, []);

  const todayPromos = allPromos.filter(p => isTodayActive(p.days));
  const otherPromos = allPromos.filter(p => !isTodayActive(p.days));
  const hasContent = allPromos.length > 0 || offerItems.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Promoções"
        subtitle="Ofertas especiais dos restaurantes parceiros"
        icon="🎁"
      />

      <div className="container mx-auto max-w-5xl px-4 py-6">
        {loading && <p className="text-center text-gray-400 py-16">Carregando...</p>}

        {!loading && !hasContent && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🎁</p>
            <p className="font-semibold text-lg">Nenhuma promoção ativa no momento</p>
            <p className="text-sm mt-2">Volte em breve para conferir as ofertas dos restaurantes</p>
          </div>
        )}

        {!loading && hasContent && (
          <div className="space-y-10">

            {/* ── PRATOS EM OFERTA ── */}
            {offerItems.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🏷️ Pratos em Oferta
                  <span className="text-sm font-normal text-gray-500">({offerItems.length} {offerItems.length === 1 ? 'item' : 'itens'})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offerItems.map(item => (
                    <Link key={item.id} to={`/restaurante/${item.restaurant!.slug}`} className="block">
                      <div className="border-2 border-yellow-300 rounded-xl p-4 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg transition-all hover:border-yellow-400">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{item.image || '🍽️'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">Em Oferta</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{item.restaurant!.name} · {item.restaurant!.category}</p>
                            {item.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {isAuthenticated ? (
                              <>
                                {item.price && <p className="text-xs line-through text-gray-400">R$ {item.price.toFixed(2)}</p>}
                                <p className="text-base font-bold text-[#C92924]">R$ {item.offerPrice!.toFixed(2)}</p>
                              </>
                            ) : (
                              <p className="text-xs text-gray-400">🔒 Login</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── PROMOÇÕES DOS RESTAURANTES ── */}
            {allPromos.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🎁 Promoções dos Restaurantes
                  <span className="text-sm font-normal text-gray-500">({todayPromos.length} válidas hoje)</span>
                </h2>

                {todayPromos.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1">✅ Válidas hoje</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {todayPromos.map(p => (
                        <Link key={p.id} to={`/restaurante/${p.restaurant!.slug}`} className="block">
                          <div className="border-2 border-[#C92924]/40 rounded-xl p-4 bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-lg transition-all hover:border-[#C92924]">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-3xl">{p.restaurant!.logo}</span>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{p.restaurant!.name}</p>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✅ Hoje</span>
                              </div>
                            </div>
                            <h3 className="font-bold text-[#C92924] text-sm mb-1">{p.title}</h3>
                            <p className="text-sm text-gray-700 mb-2">{p.condition}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>🕐 {p.startTime} – {p.endTime}</span>
                              <span>📅 {p.days.map(d => DAY_SHORT[d]).join(', ')}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {otherPromos.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1">📅 Outras datas</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {otherPromos.map(p => (
                        <Link key={p.id} to={`/restaurante/${p.restaurant!.slug}`} className="block">
                          <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all hover:border-[#C92924]/40">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-3xl">{p.restaurant!.logo}</span>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{p.restaurant!.name}</p>
                                <div className="flex gap-1 flex-wrap mt-0.5">
                                  {p.days.map(d => (
                                    <span key={d} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{DAY_SHORT[d]}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm mb-1">{p.title}</h3>
                            <p className="text-sm text-gray-600 mb-1">{p.condition}</p>
                            <p className="text-xs text-gray-400">🕐 {p.startTime} – {p.endTime}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
