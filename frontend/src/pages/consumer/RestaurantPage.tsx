import { useParams, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { mockRestaurants } from '../../lib/mockRestaurants';
import { mockCategories, mockMenuItems } from '../../lib/mockMenu';
import { Badge } from '../../components/shared';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export default function RestaurantPage() {
  useScrollToTop();
  const { slug } = useParams<{ slug: string }>();
  const restaurant = mockRestaurants.find(r => r.slug === slug);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark mb-4">Restaurante não encontrado</h1>
          <Link to="/" className="text-primary hover:underline">
            Voltar para home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header do Restaurante */}
      <div 
        className="border-b-2 border-dark/10 shadow-lg"
        style={{ backgroundColor: restaurant.headerColor || '#C92924' }}
      >
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1 text-white hover:text-white/80 font-semibold mb-2 transition-colors text-sm">
            <span>←</span> Voltar
          </Link>
          
          <div className="flex flex-col items-center text-center mb-3">
            <div className="text-6xl drop-shadow-lg mb-2">{restaurant.logo}</div>
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{restaurant.name}</h1>
            <span className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-md ${
              restaurant.isOpen 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {restaurant.isOpen ? '🟢 Aberto' : '🔴 Fechado'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <div className="text-xs font-bold text-dark">{restaurant.rating}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <div>
                  <div className="text-xs font-bold text-dark">{restaurant.distance} km</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">🕐</span>
                <div>
                  <div className="text-xs font-bold text-dark">{restaurant.deliveryTime}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">💵</span>
                <div>
                  <div className="text-xs font-bold text-dark">R$ {restaurant.minOrder.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cardápio */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold text-dark mb-6 text-center">📋 Cardápio</h2>

        {mockCategories.map(category => {
          const items = mockMenuItems.filter(item => item.categoryId === category.id);
          if (items.length === 0) return null;

          return (
            <div key={category.id} className="mb-8">
              <h3 className="text-xl font-semibold text-dark mb-4">{category.name}</h3>
              
              <div className="space-y-3">
                {items.map(item => {
                  const isExpanded = expandedItem === item.id;
                  const cheapestPrice = Math.min(...Object.values(item.prices).filter(p => p !== undefined) as number[]);
                  const itemRef = useRef<HTMLDivElement>(null);

                  useEffect(() => {
                    if (isExpanded && itemRef.current) {
                      setTimeout(() => {
                        itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }, 100);
                    }
                  }, [isExpanded]);
                  
                  return (
                    <div key={item.id} ref={itemRef} className="bg-white rounded-xl border border-dark/10 overflow-hidden hover:shadow-lg transition-all duration-300">
                      {/* Item Principal */}
                      <div className="p-4 flex items-start gap-3 bg-gradient-to-r from-white to-secondary/10">
                        <div className="text-7xl flex-shrink-0 drop-shadow-md">{item.image}</div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xl font-bold text-dark mb-2">{item.name}</h4>
                          <p className="text-sm text-dark/70 mb-3 leading-relaxed">{item.description}</p>
                          
                          <div className="flex gap-2 flex-wrap">
                            {item.exclusive === 'delivery' && (
                              <Badge variant="delivery" className="text-xs">Exclusivo Delivery</Badge>
                            )}
                            {item.exclusive === 'presencial' && (
                              <Badge variant="presencial" className="text-xs">Exclusivo Presencial</Badge>
                            )}
                            {!item.available && (
                              <Badge variant="cancelado" className="text-xs">Indisponível</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <div className="text-xs text-dark/50 mb-1">a partir de</div>
                            <span className="text-3xl font-bold text-primary drop-shadow-sm">
                              R$ {cheapestPrice.toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                            className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                          >
                            {isExpanded ? (
                              <>
                                <span>Fechar</span>
                                <span className="text-lg">↑</span>
                              </>
                            ) : (
                              <>
                                <span>Ver Detalhes</span>
                                <span className="text-lg">↓</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Detalhes Expandidos */}
                      {isExpanded && (
                        <div className="border-t-2 border-dark/10 animate-slide-in-up">
                          {/* Faixa de Alergias - Apenas se houver alérgenos */}
                          {item.allergens && item.allergens.length > 0 && (
                            <div className="bg-gradient-to-r from-amber-100 to-amber-50 border-b-2 border-amber-400 px-5 py-4 shadow-inner">
                              <div className="flex items-center gap-3 text-sm overflow-hidden">
                                <span className="text-amber-800 font-semibold whitespace-nowrap flex-shrink-0">⚠️ Contém:</span>
                                <div className="flex gap-3 text-amber-800 font-medium overflow-x-auto scrollbar-hide">
                                  {item.allergens.includes('gluten') && (
                                    <span className="flex items-center gap-1 whitespace-nowrap" title="Glúten">
                                      <span className="text-xl">🍞</span> Glúten
                                    </span>
                                  )}
                                  {item.allergens.includes('dairy') && (
                                    <span className="flex items-center gap-1 whitespace-nowrap" title="Laticínios">
                                      <span className="text-xl">🧀</span> Laticínios
                                    </span>
                                  )}
                                  {item.allergens.includes('eggs') && (
                                    <span className="flex items-center gap-1 whitespace-nowrap" title="Ovos">
                                      <span className="text-xl">🥚</span> Ovos
                                    </span>
                                  )}
                                  {item.allergens.includes('nuts') && (
                                    <span className="flex items-center gap-1 whitespace-nowrap" title="Nozes">
                                      <span className="text-xl">🥜</span> Nozes
                                    </span>
                                  )}
                                  {item.allergens.includes('soy') && (
                                    <span className="flex items-center gap-1 whitespace-nowrap" title="Soja">
                                      <span className="text-xl">🫘</span> Soja
                                    </span>
                                  )}
                                  {item.allergens.includes('fish') && (
                                    <span className="flex items-center gap-1" title="Peixe">
                                      <span className="text-xl">🐟</span> Peixe
                                    </span>
                                  )}
                                  {item.allergens.includes('shellfish') && (
                                    <span className="flex items-center gap-1" title="Frutos do Mar">
                                      <span className="text-xl">🦐</span> Frutos do Mar
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Ingredientes */}
                          {item.ingredients && (
                            <div className="px-5 py-4 bg-gradient-to-br from-gray-50 to-white">
                              <h5 className="font-bold text-dark mb-3 text-base flex items-center gap-2">
                                <span className="text-xl">🧂</span> Ingredientes:
                              </h5>
                              <p className="text-sm text-dark/80 leading-relaxed pl-7">{item.ingredients}</p>
                            </div>
                          )}

                          {/* Comparação de Preços */}
                          <div className="px-5 py-4 bg-gradient-to-br from-white to-secondary/5">
                            <h5 className="font-bold text-dark mb-4 text-base flex items-center gap-2">
                              <span className="text-xl">💰</span> Compare os Preços:
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                              {item.prices.mymenu && (
                                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-lg border-2 border-primary/30 shadow-sm">
                                  <span className="text-sm font-bold text-primary">MYMENU</span>
                                  <span className="text-base font-bold text-primary">R$ {item.prices.mymenu.toFixed(2)}</span>
                                </div>
                              )}
                              {item.prices.ifood && (
                                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200 shadow-sm">
                                  <span className="text-sm font-semibold text-red-700">🔴 iFood</span>
                                  <span className="text-base font-bold text-red-700">R$ {item.prices.ifood.toFixed(2)}</span>
                                </div>
                              )}
                              {item.prices.ubereats && (
                                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200 shadow-sm">
                                  <span className="text-sm font-semibold text-green-700">🟢 Uber Eats</span>
                                  <span className="text-base font-bold text-green-700">R$ {item.prices.ubereats.toFixed(2)}</span>
                                </div>
                              )}
                              {item.prices.rappi && (
                                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border border-orange-200 shadow-sm">
                                  <span className="text-sm font-semibold text-orange-700">🟠 Rappi</span>
                                  <span className="text-base font-bold text-orange-700">R$ {item.prices.rappi.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
