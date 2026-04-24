import { useState } from 'react';

import { mockRestaurants } from '../../lib/mockRestaurants';
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
  { name: 'Outros', icon: '⋯' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRestaurants = mockRestaurants
    .filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                         r.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !selectedCategory || r.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .slice(0, 4);

  const uniqueCategories = ['all', ...new Set(mockRestaurants.map(r => r.category))];

  return (
    <div className="w-full">
      {/* Hero Banner com Carrossel */}
      <div className="relative w-full h-80">
        <ImageCarousel />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Texto Hero */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <div className="text-5xl mb-2">🍽️</div>
          <h1 className="text-5xl font-bold mb-2">Olá, seja bem-vindo ao MYMENU</h1>
          <p className="text-lg">Encontre os melhores restaurantes perto de você</p>
        </div>

        {/* Barra de Busca - Sobreposta na parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent pt-8 pb-6">
          <div className="max-w-4xl mx-auto px-6 flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar restaurantes ou categorias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                <p className="text-xs font-semibold text-dark mb-2">Categoria</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                      className={`px-3 py-1 rounded text-xs transition-all ${
                        selectedCategory === cat
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-dark hover:bg-gray-300'
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Melhores Ofertas */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl p-6 flex items-center justify-between text-white shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🔥</span>
              <div>
                <h2 className="text-2xl font-bold">Melhores Ofertas</h2>
                <p className="text-sm opacity-90">Restaurantes com os melhores preços perto de você</p>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all">
              <span className="text-2xl">→</span>
            </button>
          </div>
        </div>

        {/* Categorias */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-700">Categorias</h2>
            <button className="text-red-600 hover:text-red-700 font-semibold text-sm">
              Ver todas →
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedCategory === cat.name
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="text-4xl mb-2">{cat.icon}</div>
                <p className="text-sm font-medium text-gray-700">{cat.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Perto de você */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-700">Perto de você</h2>
            <button className="text-red-600 hover:text-red-700 font-semibold text-sm">
              Ver todas →
            </button>
          </div>
          
          {filteredRestaurants.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum restaurante encontrado</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredRestaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="relative h-40 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                    <div className="text-6xl">{restaurant.logo}</div>
                    {restaurant.plan === 'diamante' && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-red-900 px-2 py-1 rounded-full text-xs font-semibold">
                        ⭐ Oferta
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1">{restaurant.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-semibold text-gray-700">{restaurant.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {restaurant.category} • {restaurant.deliveryTime}
                    </p>
                    <p className="text-xs text-gray-500">
                      R$ • R$
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Todos os Restaurantes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-red-700 mb-6">Todos os Restaurantes ({mockRestaurants.length})</h2>
          <div className="space-y-4">
            {mockRestaurants.slice(0, 6).map((restaurant, index) => (
              <div
                key={restaurant.id}
                className="animate-slide-in-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
