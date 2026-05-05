import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockRestaurants } from '../../lib/mockRestaurants';
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

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const catRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const offersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.type === 'admin') navigate('/admin/dashboard');
  }, [user, navigate]);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (ref.current) ref.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const filteredRestaurants = mockRestaurants.filter(r => {
    const matchSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || r.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const nearRestaurants = [...filteredRestaurants].sort((a, b) => a.distance - b.distance);
  const offerRestaurants = mockRestaurants.filter(r => r.plan === 'diamante' || r.plan === 'ouro');
  const uniqueCategories = ['all', ...new Set(mockRestaurants.map(r => r.category))];

  return (
    <div className="w-full" style={{ backgroundColor: '#f8f5ef' }}>

      {/* Hero Banner */}
      <div className="relative w-full h-80 overflow-hidden">
        <ImageCarousel />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 px-4">
          <p className="text-lg font-medium opacity-95 mb-1">Olá, seja bem-vindo ao</p>
          <h1 className="text-5xl font-bold mb-3" style={{ color: '#A89968' }}>MYMENU</h1>
          <p className="text-base opacity-90">Encontre os melhores restaurantes perto de você</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pb-8 pt-16 bg-gradient-to-t from-black/50 to-transparent flex items-end z-20">
          <div className="max-w-5xl mx-auto px-6 w-full flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar restaurantes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border-0 rounded-xl shadow-lg py-3 px-5"
              />
            </div>
            <FilterButton
              activeFiltersCount={selectedCategory ? 1 : 0}
              showFilters={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
              onClearFilters={() => setSelectedCategory('')}
            >
              <div>
                <p className="text-xs font-semibold text-gray-800 mb-3">Filtrar por Categoria</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                      className={`px-3 py-1 rounded text-xs transition-all ${selectedCategory === cat ? 'bg-red-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {cat === 'all' ? 'Todas' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </FilterButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-14">

        {/* ── OFERTAS ESPECIAIS ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl animate-float">🔥</span>
            <div>
              <h2 className="text-2xl font-bold leading-none" style={{ color: '#660000' }}>Ofertas Especiais</h2>
              <p className="text-xs text-gray-500 mt-0.5">Promoções imperdíveis de hoje</p>
            </div>
          </div>

          {/* Banner destaque */}
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

          {/* Cards de ofertas — carrossel */}
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
                    <span className="bg-white/25 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/30">
                      {offer.badge}
                    </span>
                  </div>
                  <p className="font-bold text-sm leading-tight">{offer.title}</p>
                  <p className="text-white/75 text-xs mt-1">{offer.subtitle}</p>
                </div>
              ))}
            </div>
            <CarouselArrow direction="right" onClick={() => scroll(offersRef, 'right')} />
          </div>

          {/* Restaurantes em oferta */}
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
                    <p className="text-xs text-gray-500">{r.deliveryTime} • {r.distance}km</p>
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
              {selectedCategory || 'Perto de você'}
            </h2>
            <span className="text-xs bg-red-100 font-semibold px-2 py-0.5 rounded-full" style={{ color: '#660000' }}>
              📍 {nearRestaurants.length} locais
            </span>
          </div>

          {nearRestaurants.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum restaurante encontrado</p>
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
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-800 text-sm truncate">{r.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.category} • {r.deliveryTime}</p>
                        <p className="text-xs font-medium mt-1" style={{ color: '#660000' }}>📍 {r.distance}km</p>
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
            {selectedCategory ? `Todos os ${selectedCategory}` : 'Todos os Restaurantes'}
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
  );
}
