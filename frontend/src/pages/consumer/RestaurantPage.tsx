import { useParams, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { getRestaurantBySlug, getCategories, getMenuItems, getPromotions, getRatingData, getUserRating, submitRating } from '../../lib/firestoreService';
import type { Restaurant, MenuItem, MenuCategory } from '../../types/restaurant';
import type { Promotion, PromotionDay } from '../../types';
import { Badge, LoginPromptModal } from '../../components/shared';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { useAuth } from '../../contexts/AuthContext';

const JS_DAY_MAP: PromotionDay[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const DAY_SHORT: Record<PromotionDay, string> = {
  seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb', dom: 'Dom',
};

// ── MenuItemCard extraído para não violar Rules of Hooks ──────────────
function MenuItemCard({
  item,
  isAuthenticated,
  onLoginPrompt,
}: {
  item: MenuItem;
  isAuthenticated: boolean;
  onLoginPrompt: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && itemRef.current) {
      setTimeout(() => itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
  }, [isExpanded]);

  const displayPrice = item.isOffer && item.offerPrice ? item.offerPrice : item.price;
  const originalPrice = item.isOffer && item.offerPrice ? item.price : null;

  return (
    <div
      ref={itemRef}
      className={`bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 ${
        item.isOffer ? 'border-2 border-yellow-300 shadow-md' : 'border border-dark/10'
      }`}
    >
      <div className={`p-4 flex items-start gap-3 ${item.isOffer ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gradient-to-r from-white to-secondary/10'}`}>
        <div className="text-7xl flex-shrink-0 drop-shadow-md">{item.image}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="text-xl font-bold text-dark">{item.name}</h4>
            {item.isOffer && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 whitespace-nowrap">
                🎁 Em Oferta
              </span>
            )}
          </div>
          <p className="text-sm text-dark/70 mb-3 leading-relaxed">{item.description}</p>
          <div className="flex gap-2 flex-wrap">
            {item.exclusive === 'delivery' && <Badge variant="delivery" className="text-xs">Exclusivo Delivery</Badge>}
            {item.exclusive === 'presencial' && <Badge variant="presencial" className="text-xs">Exclusivo Presencial</Badge>}
            {!item.available && <Badge variant="cancelado" className="text-xs">Indisponível</Badge>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            {isAuthenticated ? (
              item.isOffer && originalPrice ? (
                <>
                  <div className="text-xs text-dark/50 mb-1">Oferta especial</div>
                  <p className="text-sm line-through text-gray-500">R$ {originalPrice.toFixed(2)}</p>
                  <span className="text-3xl font-bold text-primary drop-shadow-sm">R$ {displayPrice.toFixed(2)}</span>
                </>
              ) : (
                <>
                  <div className="text-xs text-dark/50 mb-1">a partir de</div>
                  <span className="text-3xl font-bold text-primary drop-shadow-sm">R$ {displayPrice.toFixed(2)}</span>
                </>
              )
            ) : (
              <button onClick={onLoginPrompt} className="text-sm text-gray-400 flex items-center gap-1 hover:text-[#C92924] transition-colors">
                🔒 <span className="underline decoration-dotted">ver preço</span>
              </button>
            )}
          </div>
          <button
            onClick={() => isAuthenticated ? setIsExpanded(e => !e) : onLoginPrompt()}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            {isAuthenticated && isExpanded ? (
              <><span>Fechar</span><span className="text-lg">↑</span></>
            ) : isAuthenticated ? (
              <><span>Ver Detalhes</span><span className="text-lg">↓</span></>
            ) : (
              <span>🔒 Ver Detalhes</span>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t-2 border-dark/10 animate-slide-in-up">
          {item.allergens && item.allergens.length > 0 && (
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 border-b-2 border-amber-400 px-5 py-4 shadow-inner">
              <div className="flex items-center gap-3 text-sm overflow-hidden">
                <span className="text-amber-800 font-semibold whitespace-nowrap flex-shrink-0">⚠️ Contém:</span>
                <div className="flex gap-3 text-amber-800 font-medium overflow-x-auto">
                  {item.allergens.includes('gluten') && <span className="flex items-center gap-1 whitespace-nowrap"><span className="text-xl">🍞</span> Glúten</span>}
                  {item.allergens.includes('dairy') && <span className="flex items-center gap-1 whitespace-nowrap"><span className="text-xl">🧀</span> Laticínios</span>}
                  {item.allergens.includes('eggs') && <span className="flex items-center gap-1 whitespace-nowrap"><span className="text-xl">🥚</span> Ovos</span>}
                  {item.allergens.includes('nuts') && <span className="flex items-center gap-1 whitespace-nowrap"><span className="text-xl">🥜</span> Nozes</span>}
                  {item.allergens.includes('soy') && <span className="flex items-center gap-1 whitespace-nowrap"><span className="text-xl">🫘</span> Soja</span>}
                  {item.allergens.includes('fish') && <span className="flex items-center gap-1"><span className="text-xl">🐟</span> Peixe</span>}
                  {item.allergens.includes('shellfish') && <span className="flex items-center gap-1"><span className="text-xl">🦐</span> Frutos do Mar</span>}
                </div>
              </div>
            </div>
          )}
          {item.ingredients && (
            <div className="px-5 py-4 bg-gradient-to-br from-gray-50 to-white">
              <h5 className="font-bold text-dark mb-3 text-base flex items-center gap-2">
                <span className="text-xl">🧂</span> Ingredientes:
              </h5>
              <p className="text-sm text-dark/80 leading-relaxed pl-7">{item.ingredients}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────
export default function RestaurantPage() {
  useScrollToTop();
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingRating, setPendingRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getRestaurantBySlug(slug)
      .then(async rest => {
        if (!rest) { setLoading(false); return; }
        setRestaurant(rest);
        const [cats, items, promos] = await Promise.all([
          getCategories(rest.id),
          getMenuItems(rest.id),
          getPromotions(rest.id),
        ]);
        setCategories(cats);
        setMenuItems(items);
        setPromotions(promos.filter(p => p.active));
        setLoading(false);
        getRatingData(rest.id).then(setRatingData).catch(() => {});
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!restaurant || !user?.id) return;
    getUserRating(restaurant.id, user.id).then(setUserRating);
  }, [restaurant?.id, user?.id]);

  const handleSubmitRating = async () => {
    if (!restaurant || !user?.id || pendingRating === 0) return;
    setSubmittingRating(true);
    try {
      const result = await submitRating(restaurant.id, user.id, pendingRating);
      setRatingData(result);
      setUserRating(pendingRating);
    } catch (_) {}
    setShowRatingModal(false);
    setSubmittingRating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-[#C92924] font-bold text-lg">Carregando...</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark mb-4">Restaurante não encontrado</h1>
          <Link to="/" className="text-primary hover:underline">Voltar para home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header do Restaurante */}
      <div className="border-b-2 border-dark/10 shadow-lg" style={{ backgroundColor: restaurant.headerColor || '#C92924' }}>
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1 text-white hover:text-white/80 font-semibold mb-2 transition-colors text-sm">
            <span>←</span> Voltar
          </Link>

          <div className="flex flex-col items-center text-center mb-3">
            <div className="text-6xl drop-shadow-lg mb-2">{restaurant.logo}</div>
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{restaurant.name}</h1>
            <span className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-md ${restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {restaurant.isOpen ? '🟢 Aberto' : '🔴 Fechado'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* Avaliação */}
            <button
              onClick={() => isAuthenticated ? setShowRatingModal(true) : setShowLoginModal(true)}
              className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 text-left hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg">⭐</span>
                <div>
                  <div className="text-xs font-bold text-dark">
                    {ratingData.count > 0 ? ratingData.average : '—'}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-none">
                    {userRating ? `Sua nota: ${userRating}` : 'Avaliar'}
                  </div>
                </div>
              </div>
            </button>

            {/* Endereço */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">📍</span>
                <div className="text-xs font-bold text-dark truncate">
                  {restaurant.city || restaurant.address || '—'}
                </div>
              </div>
            </div>

            {/* Horário */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🕐</span>
                <div className="text-xs font-bold text-dark">
                  {restaurant.openTime && restaurant.closeTime
                    ? `${restaurant.openTime}–${restaurant.closeTime}`
                    : restaurant.deliveryTime}
                </div>
              </div>
            </div>

            {/* Pedido mínimo */}
            <div
              className={`bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 ${!isAuthenticated ? 'cursor-pointer' : ''}`}
              onClick={!isAuthenticated ? () => setShowLoginModal(true) : undefined}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg">💵</span>
                <div>
                  {isAuthenticated ? (
                    <div className="text-xs font-bold text-dark">R$ {restaurant.minOrder.toFixed(2)}</div>
                  ) : (
                    <div className="text-xs font-bold text-gray-400">🔒 Login</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promoções */}
      {promotions.length > 0 && (() => {
        const today = JS_DAY_MAP[new Date().getDay()];
        return (
          <div className="container mx-auto max-w-6xl px-4 pt-6">
            <h2 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">🎁 Promoções</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              {promotions.map(p => {
                const activeToday = p.days.includes(today);
                return (
                  <div key={p.id} className={`rounded-xl p-3 border-2 ${activeToday ? 'border-[#C92924]/40 bg-red-50' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{p.title}</p>
                        <p className="text-xs text-[#C92924] font-semibold mt-0.5">{p.condition}</p>
                        <div className="flex gap-2 mt-1.5 text-xs text-gray-500">
                          <span>🕐 {p.startTime}–{p.endTime}</span>
                          <span>📅 {p.days.map(d => DAY_SHORT[d]).join(', ')}</span>
                        </div>
                      </div>
                      {activeToday && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">Hoje</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Cardápio */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold text-dark mb-6 text-center">📋 Cardápio</h2>

        {categories.length === 0 && menuItems.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Cardápio em construção. Volte em breve!</p>
        ) : (
          categories.map(category => {
            const items = menuItems.filter(item => item.categoryId === category.id);
            if (items.length === 0) return null;
            return (
              <div key={category.id} className="mb-8">
                <h3 className="text-xl font-semibold text-dark mb-4">{category.name}</h3>
                <div className="space-y-3">
                  {items.map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      isAuthenticated={isAuthenticated}
                      onLoginPrompt={() => setShowLoginModal(true)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Avaliação */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Avaliar {restaurant.name}</h2>
              <button onClick={() => setShowRatingModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            {userRating && (
              <p className="text-sm text-gray-500 mb-3">Sua avaliação atual: <strong>{userRating} ⭐</strong></p>
            )}
            <div className="flex justify-center gap-3 mb-5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setPendingRating(star)}
                  className={`text-4xl transition-transform hover:scale-110 ${star <= pendingRating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            {pendingRating > 0 && (
              <p className="text-center text-sm text-gray-600 mb-4">
                {['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'][pendingRating]}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={pendingRating === 0 || submittingRating}
                className="flex-1 py-2 bg-[#C92924] text-white rounded-lg text-sm font-bold hover:bg-[#a81f1a] transition-colors disabled:opacity-50"
              >
                {submittingRating ? 'Enviando...' : 'Enviar Nota'}
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Para ver preços e detalhes completos, faça login ou crie uma conta gratuita."
      />
    </div>
  );
}
