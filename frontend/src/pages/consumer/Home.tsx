import { useState, useEffect } from 'react';
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
  { name: 'Sobremesas', icon: '🍮' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandNearby, setExpandNearby] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [expandCategories, setExpandCategories] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redireciona admin para o dashboard
  useEffect(() => {
    if (user?.type === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  // LÓGICA DE FILTRO - PASSO 1: Filtra por categoria
  let filteredByCategory = mockRestaurants;
  if (selectedCategory && selectedCategory !== '') {
    filteredByCategory = mockRestaurants.filter(r => r.category === selectedCategory);
  }

  // LÓGICA DE FILTRO - PASSO 2: Filtra por busca
  const filteredRestaurants = filteredByCategory.filter(restaurant => {
    if (search === '') return true;
    return (
      restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
      restaurant.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Pega apenas os primeiros 8 para a seção "Perto de você"
  // const nearbyRestaurants = filteredRestaurants.slice(0, 8);

  const uniqueCategories = ['all', ...new Set(mockRestaurants.map(r => r.category))];

  return (
    <div className="w-full" style={{ backgroundColor: '#f8f5ef' }}>
      {/* Hero Banner com Carrossel */}
      <div className="relative w-full h-80 overflow-hidden">
        <ImageCarousel />
        
        {/* Overlay escuro profundo */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60"></div>
        
        {/* Texto Hero - Elegante e Premium */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10">
          <p className="text-lg font-medium opacity-95 mb-2">Olá, seja bem-vindo ao</p>
          <h1 className="text-5xl font-bold mb-3" style={{ color: '#A89968' }}>MYMENU</h1>
          <p className="text-base opacity-90">Encontre os melhores restaurantes perto de você</p>
        </div>

        {/* Barra de Busca - Flutuando sobre o banner */}
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
              activeFiltersCount={0}
              showFilters={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
              onClearFilters={() => setSelectedCategory('')}
            >
              {/* Filtros simples */}
              <div>
                <p className="text-xs font-semibold text-gray-800 mb-3">Filtrar por Categoria</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                      className={`px-3 py-1 rounded text-xs transition-all ${
                        selectedCategory === cat
                          ? 'bg-red-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
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

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Melhores Ofertas */}
        <div className="mb-16">
          <Link to="/ofertas" className="block">
            <div className="p-8 flex items-center justify-between text-white shadow-lg hover:shadow-xl transition-shadow rounded-2xl cursor-pointer" style={{ backgroundImage: 'linear-gradient(to right, #660000, #8B6F47)' }}>
              <div className="flex items-center gap-6">
                <div className="bg-white/20 p-4 rounded-full">
                  <span className="text-5xl">🔥</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Melhores Ofertas</h2>
                  <p className="text-sm opacity-90 mt-1">Restaurantes com os melhores preços perto de você</p>
                </div>
              </div>
              <div className="bg-white hover:bg-gray-100 p-4 rounded-full transition-all shadow-md" style={{ color: '#660000' }}>
                <span className="text-2xl">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Categorias */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold" style={{ color: '#660000' }}>Categorias</h2>
            {categories.length > 6 && (
              <button 
                onClick={() => setExpandCategories(!expandCategories)}
                className="font-semibold text-sm transition-colors" 
                style={{ color: '#660000' }}
              >
                {expandCategories ? 'Ver menos ←' : 'Ver todas →'}
              </button>
            )}
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${expandCategories ? Math.min(categories.length, 8) : 6}, minmax(0, 1fr))` }}>
            {categories.slice(0, expandCategories ? categories.length : 6).map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
                className={`p-4 rounded-2xl transition-all duration-300 border-2 ${
                  selectedCategory === cat.name
                    ? 'shadow-lg bg-red-50'
                    : 'border-gray-200 bg-white hover:shadow-md shadow-sm'
                }`}
                style={selectedCategory === cat.name ? { borderColor: '#660000' } : { borderColor: '#E5E7EB' }}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="text-xs font-semibold text-gray-800 text-center leading-tight">{cat.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Perto de você - Mostra restaurantes filtrados por categoria ou busca */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold" style={{ color: '#660000' }}>
                {selectedCategory && selectedCategory !== '' ? `${selectedCategory}` : 'Perto de você'}
              </h2>
              {selectedCategory && selectedCategory !== '' && (
                <p className="text-sm text-gray-600 mt-2">
                  Mostrando {filteredRestaurants.length} restaurante(s) de {selectedCategory}
                </p>
              )}
            </div>
            {filteredRestaurants.length > 4 && (
              <button 
                onClick={() => setExpandNearby(!expandNearby)}
                className="font-semibold text-sm transition-colors" 
                style={{ color: '#660000' }}
              >
                {expandNearby ? 'Ver menos ←' : 'Ver todas →'}
              </button>
            )}
          </div>
          
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {search 
                  ? `Nenhum restaurante encontrado para "${search}"` 
                  : selectedCategory && selectedCategory !== '' 
                    ? `Nenhum restaurante encontrado em ${selectedCategory}`
                    : 'Nenhum restaurante encontrado'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredRestaurants.slice(0, expandNearby ? filteredRestaurants.length : 4).map((restaurant, index) => (
                <Link key={restaurant.id} to={`/restaurante/${restaurant.slug}`}>
                  <div
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200 cursor-pointer"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="relative h-44 flex items-center justify-center" style={{ backgroundColor: '#660000' }}>
                      <div className="text-6xl">{restaurant.logo}</div>
                      {restaurant.plan === 'diamante' && (
                        <div className="absolute top-3 right-3 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1" style={{ backgroundColor: '#660000' }}>
                          <span>🏷️</span> Oferta
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2 text-base">{restaurant.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-500 text-sm">⭐</span>
                        <span className="text-sm font-semibold text-gray-800">{restaurant.rating}</span>
                        <span className="text-xs text-gray-500">({Math.floor(Math.random() * 500 + 50)})</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {restaurant.category} • {restaurant.deliveryTime}
                      </p>
                      <p className="text-xs font-semibold" style={{ color: '#c62828' }}>
                        R$ • R$ • R$ (Faixa de preço)
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Todos os Restaurantes */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold" style={{ color: '#660000' }}>
              {selectedCategory ? `Todos os ${selectedCategory} (${filteredRestaurants.length})` : `Todos os Restaurantes (${filteredRestaurants.length})`}
            </h2>
            {filteredRestaurants.length > 6 && (
              <button 
                onClick={() => setExpandAll(!expandAll)}
                className="font-semibold text-sm transition-colors" 
                style={{ color: '#660000' }}
              >
                {expandAll ? 'Ver menos ←' : 'Ver todos →'}
              </button>
            )}
          </div>
          <div className="space-y-4">
            {filteredRestaurants.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum restaurante encontrado</p>
            ) : (
              filteredRestaurants.slice(0, expandAll ? filteredRestaurants.length : 6).map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="animate-slide-in-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <RestaurantCard restaurant={restaurant} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
