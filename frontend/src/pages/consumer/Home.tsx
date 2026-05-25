import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../lib/firestoreService';
import type { Restaurant } from '../../types/restaurant';
import { useAuth } from '../../contexts/AuthContext';
import RestaurantCard from '../../components/consumer/RestaurantCard';
import { Input, FilterButton, ImageCarousel } from '../../components/shared';

const categories = [
  { name: 'Brasileira', icon: '🥘' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Lanches', icon: '🍔' },
  { name: 'Japonesa', icon: '🍱' },
  { name: 'Doces', icon: '🍰' },
  { name: 'Bebidas', icon: '🥤' },
  { name: 'Saudável', icon: '🥗' },
  { name: 'Italiana', icon: '🍝' },
  { name: 'Sobremesas', icon: '🍮' },
  { name: 'Padaria', icon: '🥖' },
];

const offerCards = [
  { emoji: '🍕', title: 'Pizza com 30% OFF', subtitle: 'Toda terça-feira', bg: 'from-red-600 to-orange-500', badge: '30% OFF' },
  { emoji: '🍔', title: 'Combo Burger + Bebida', subtitle: 'Por apenas R$ 29,90', bg: 'from-yellow-500 to-orange-400', badge: 'COMBO' },
  { emoji: '🍣', title: 'Rodízio Japonês', subtitle: 'Frete grátis hoje', bg: 'from-purple-600 to-pink-500', badge: 'FRETE GRÁTIS' },
  { emoji: '🥗', title: 'Bowl Fit Saudável', subtitle: '2 por R$ 35,00', bg: 'from-green-500 to-teal-400', badge: 'LEVE 2' },
  { emoji: '🍰', title: 'Sobremesas Especiais', subtitle: 'A partir de R$ 12,00', bg: 'from-pink-500 to-rose-400', badge: 'ESPECIAL' },
  { emoji: '☕', title: 'Café da Manhã', subtitle: 'Entrega em 15 min', bg: 'from-amber-600 to-yellow-500', badge: '15 MIN' },
];

function CarouselArrow({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-all ${direction === 'left' ? '-left-4' : '-right-4'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        {direction === 'left'
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );
}

function getCategoryIcon(name: string): string {
  return categories.find(c => c.name === name)?.icon ?? '🍽️';
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const catRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const offersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.type === 'admin') navigate('/admin/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    getRestaurants()
      .then(setRestaurants)
      .finally(() => setLoadingRestaurants(false));
  }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (ref.current) ref.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const isResultsMode = search.trim().length > 0;
  const activeFiltersCount = (selectedCategory ? 1 : 0) + (filterOpenNow ? 1 : 0);

  const filteredRestaurants = restaurants.filter(r => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q || r.name.toLowerCase().startsWith(q);
    const matchCategory = !selectedCategory || r.category === selectedCategory;
    const matchOpen = !filterOpenNow || r.isOpen;
    return matchSearch && matchCategory && matchOpen;
  });

  const nearRestaurants = [...filteredRestaurants].sort((a, b) => a.distance - b.distance);
  const offerRestaurants = restaurants.filter(r => r.plan === 'diamante' || r.plan === 'ouro');
  const uniqueCategories = [...new Set(restaurants.map(r => r.category).filter(Boolean))];

  const clearAll = () => {
    setSearch('');
    setSelectedCategory('');
    setFilterOpenNow(false);
    setShowFilters(false);
  };

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#f8f5ef' }}>

      {/* Hero Banner */}
      <div className="relative w-full h-64 overflow-hidden">
        <ImageCarousel />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 px-4 pb-8">
          <p className="text-lg font-medium opacity-95 mb-1">Olá, seja bem-vindo ao</p>
          <h1 className="text-5xl font-bold mb-2" style={{ color: '#A89968' }}>MYMENU</h1>
          <p className="text-base opacity-90">Encontre os melhores restaurantes perto de você</p>
        </div>
      </div>

      {/* Search + Filter bar — fora do hero para o dropdown não ser cortado */}
      <div className="max-w-5xl mx-auto px-6 -mt-6 relative z-30 flex gap-3">
        <div className="flex-1 relative">
          <Input
            placeholder="Buscar pelo nome do restaurante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border-0 rounded-xl shadow-lg py-3 px-5 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              title="Limpar busca"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <FilterButton
          activeFiltersCount={activeFiltersCount}
          showFilters={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
          onClearFilters={clearAll}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Disponibilidade</p>
              <button
                onClick={() => setFilterOpenNow(v => !v)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  filterOpenNow ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <span>🟢</span> Aberto agora
                </span>
                <div className={`w-10 h-5 rounded-full transition-all relative ${filterOpenNow ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${filterOpenNow ? 'left-5' : 'left-0.5'}`} />
                </div>
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Categoria</p>
              <div className="flex flex-wrap gap-2">
                {uniqueCategories.map(cat => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(isSelected ? '' : cat);
                        setShowFilters(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={isSelected ? { backgroundColor: '#660000' } : {}}
                    >
                      <span>{getCategoryIcon(cat)}</span>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </FilterButton>
      </div>

      {/* Active filter chips */}
      {(selectedCategory || filterOpenNow) && (
        <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="text-xs text-gray-500 font-medium">Filtros ativos:</span>
          {selectedCategory && (
            <span className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#660000' }}>
              {getCategoryIcon(selectedCategory)} {selectedCategory}
              <button onClick={() => setSelectedCategory('')} className="ml-0.5 w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors">×</button>
            </span>
          )}
          {filterOpenNow && (
            <span className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
              🟢 Aberto agora
              <button onClick={() => setFilterOpenNow(false)} className="ml-0.5 w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors">×</button>
            </span>
          )}
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-700 underline transition-colors ml-1">
            Limpar tudo
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── MODO RESULTADOS DE BUSCA (fade in quando digitando) ── */}
        {isResultsMode && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm text-gray-400 mb-0.5">
                  Resultados para "<span className="font-semibold text-gray-600">{search}</span>"
                </p>
                <h2 className="text-2xl font-bold" style={{ color: '#660000' }}>
                  {filteredRestaurants.length > 0
                    ? `${filteredRestaurants.length} restaurante${filteredRestaurants.length !== 1 ? 's' : ''} encontrado${filteredRestaurants.length !== 1 ? 's' : ''}`
                    : 'Nenhum resultado'}
                </h2>
              </div>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Voltar ao início
              </button>
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-7xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-gray-700 mb-1">Nenhum restaurante encontrado</p>
                <p className="text-sm text-gray-400 mb-6">Tente outro termo ou remova os filtros</p>
                <button
                  onClick={clearAll}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#660000' }}
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRestaurants.map((r, i) => (
                  <div key={r.id} className="animate-slide-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <RestaurantCard restaurant={r} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MODO NORMAL (fade out quando digitando) ── */}
        <div style={{
          transition: 'opacity 0.25s ease, max-height 0.3s ease',
          opacity: isResultsMode ? 0 : 1,
          maxHeight: isResultsMode ? 0 : '99999px',
          overflow: 'hidden',
          pointerEvents: isResultsMode ? 'none' : 'auto',
        }}>
          <div className="space-y-14">

            {/* ── OFERTAS ESPECIAIS ── */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl animate-float">🔥</span>
                <div>
                  <h2 className="text-2xl font-bold leading-none" style={{ color: '#660000' }}>Ofertas Especiais</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Promoções imperdíveis de hoje</p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden mb-5 shadow-xl">
                <div className="flex items-center justify-between p-6" style={{ background: 'linear-gradient(135deg, #660000 0%, #8B1A1A 50%, #B8860B 100%)' }}>
                  <div className="flex items-center gap-5">
                    <div className="text-6xl animate-float">🎉</div>
                    <div className="text-white">
                      <div className="inline-block bg-yellow-400 text-red-900 text-xs font-black px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">Oferta do dia</div>
                      <h3 className="text-2xl font-black leading-tight">Frete GRÁTIS em todos<br />os pedidos acima de R$ 30</h3>
                      <p className="text-white/75 text-sm mt-1">Válido até meia-noite • Use o app</p>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-center bg-white/15 rounded-2xl px-6 py-4 border border-white/20">
                    <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Economize</span>
                    <span className="text-white text-4xl font-black">R$0</span>
                    <span className="text-white/70 text-xs">no frete</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-48 h-full opacity-10 pointer-events-none select-none">
                  <div className="absolute top-3 right-6 text-7xl">🍕</div>
                  <div className="absolute bottom-3 right-20 text-5xl">🍔</div>
                </div>
              </div>

              <div className="relative px-4">
                <CarouselArrow direction="left" onClick={() => scroll(offersRef, 'left')} />
                <div ref={offersRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {offerCards.map((offer, i) => (
                    <div
                      key={i}
                      className={`flex-shrink-0 w-48 rounded-2xl bg-gradient-to-br ${offer.bg} p-4 text-white shadow-lg cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-4xl">{offer.emoji}</span>
                        <span className="bg-white/25 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/30">{offer.badge}</span>
                      </div>
                      <p className="font-bold text-sm leading-tight">{offer.title}</p>
                      <p className="text-white/75 text-xs mt-1">{offer.subtitle}</p>
                    </div>
                  ))}
                </div>
                <CarouselArrow direction="right" onClick={() => scroll(offersRef, 'right')} />
              </div>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                {offerRestaurants.slice(0, 4).map((r) => (
                  <Link key={r.id} to={`/restaurante/${r.slug}`}>
                    <div className="relative bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-all cursor-pointer group">
                      <div className="h-24 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #660000, #8B1A1A)' }}>
                        {r.logo}
                      </div>
                      <div className="absolute top-2 left-2 bg-yellow-400 text-red-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {r.plan === 'diamante' ? '💎 TOP' : '⭐ OFERTA'}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-800 text-sm truncate">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.openTime && r.closeTime ? `${r.openTime}–${r.closeTime}` : r.deliveryTime} • {r.city || r.address || '—'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* ── CATEGORIAS ── */}
            <section>
              <h2 className="text-2xl font-bold mb-5" style={{ color: '#660000' }}>Categorias</h2>
              <div className="relative px-4">
                <CarouselArrow direction="left" onClick={() => scroll(catRef, 'left')} />
                <div ref={catRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
                      className={`flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 bg-white ${
                        selectedCategory === cat.name
                          ? 'shadow-md'
                          : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
                      }`}
                      style={selectedCategory === cat.name ? { borderColor: '#660000', backgroundColor: '#fff5f5' } : {}}
                    >
                      <span className="text-3xl">{cat.icon}</span>
                      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{cat.name}</span>
                    </button>
                  ))}
                </div>
                <CarouselArrow direction="right" onClick={() => scroll(catRef, 'right')} />
              </div>
            </section>

            {/* ── PERTO DE VOCÊ ── */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-2xl font-bold" style={{ color: '#660000' }}>
                  {selectedCategory ? getCategoryIcon(selectedCategory) + ' ' + selectedCategory : 'Perto de você'}
                </h2>
                <span className="text-xs bg-red-100 font-semibold px-2 py-0.5 rounded-full" style={{ color: '#660000' }}>
                  📍 {nearRestaurants.length} locais
                </span>
                {filterOpenNow && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">🟢 Abertos</span>}
              </div>

              {loadingRestaurants ? (
                <p className="text-center text-gray-400 py-8">Carregando restaurantes...</p>
              ) : nearRestaurants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🏪</p>
                  <p className="text-gray-500 text-sm">Nenhum restaurante para este filtro</p>
                  <button onClick={clearAll} className="mt-3 text-xs text-red-700 underline">Limpar filtros</button>
                </div>
              ) : (
                <div className="relative px-4">
                  <CarouselArrow direction="left" onClick={() => scroll(nearRef, 'left')} />
                  <div ref={nearRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                    {nearRestaurants.map((r) => (
                      <Link key={r.id} to={`/restaurante/${r.slug}`} className="flex-shrink-0 w-52">
                        <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-200 cursor-pointer group">
                          <div className="relative h-36 flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #660000, #8B1A1A)' }}>
                            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{r.logo}</span>
                            {r.plan === 'diamante' && (
                              <div className="absolute top-2 right-2 bg-yellow-400 text-red-900 px-2 py-0.5 rounded-full text-[10px] font-black">💎 TOP</div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-10" />
                            <div className="absolute bottom-2 left-2 flex items-center gap-1">
                              <span className="text-yellow-400 text-xs">⭐</span>
                              <span className="text-white text-xs font-bold">{r.rating}</span>
                            </div>
                            {r.isOpen !== undefined && (
                              <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${r.isOpen ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-200'}`}>
                                {r.isOpen ? 'Aberto' : 'Fechado'}
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-semibold text-gray-800 text-sm truncate">{r.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{r.category} • {r.openTime && r.closeTime ? `${r.openTime}–${r.closeTime}` : r.deliveryTime}</p>
                            <p className="text-xs font-medium mt-1" style={{ color: '#660000' }}>📍 {r.city || r.address || '—'}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <CarouselArrow direction="right" onClick={() => scroll(nearRef, 'right')} />
                </div>
              )}
            </section>

            {/* ── TODOS OS RESTAURANTES ── */}
            <section>
              <h2 className="text-2xl font-bold mb-5" style={{ color: '#660000' }}>
                {selectedCategory ? `Todos em ${getCategoryIcon(selectedCategory)} ${selectedCategory}` : 'Todos os Restaurantes'}
                <span className="ml-2 text-base font-normal text-gray-400">({filteredRestaurants.length})</span>
              </h2>
              <div className="space-y-3">
                {filteredRestaurants.map((r, i) => (
                  <div key={r.id} className="animate-slide-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <RestaurantCard restaurant={r} />
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
