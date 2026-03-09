import { useState } from 'react';
import type { Restaurant } from '../../types/restaurant';
import { mockRestaurants } from '../../lib/mockRestaurants';
import RestaurantCard from '../../components/consumer/RestaurantCard';
import PromotionsCarousel from '../../components/consumer/PromotionsCarousel';
import FeaturedCarousel from '../../components/consumer/FeaturedCarousel';
import { Input, PageHeader, FilterButton } from '../../components/shared'; 


export default function Home() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [distanceFilter, setDistanceFilter] = useState<number>(10);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setCategoryFilter('all');
    setDistanceFilter(10);
    setRatingFilter(0);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = search !== '' || categoryFilter !== 'all' || distanceFilter !== 10 || ratingFilter !== 0;

  // Restaurantes em destaque (Diamante e Ouro) - NÃO mostrar badge
  const featuredRestaurants = mockRestaurants
    .filter(r => r.plan === 'diamante' || r.plan === 'ouro')
    .sort((a, b) => {
      if (a.plan === 'diamante' && b.plan !== 'diamante') return -1;
      if (a.plan !== 'diamante' && b.plan === 'diamante') return 1;
      return 0;
    });

  // Todos os restaurantes filtrados e ordenados por plano (oculto do usuário)
  const filteredRestaurants = mockRestaurants
    .filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                         r.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || r.category === categoryFilter;
      const matchDistance = r.distance <= distanceFilter;
      const matchRating = r.rating >= ratingFilter;
      return matchSearch && matchCategory && matchDistance && matchRating;
    })
    .sort((a, b) => {
      // Ordenar por: plano > distância
      const planOrder = { diamante: 0, ouro: 1, prata: 2, basico: 3 };
      if (planOrder[a.plan] !== planOrder[b.plan]) {
        return planOrder[a.plan] - planOrder[b.plan];
      }
      return a.distance - b.distance;
    });

  const categories = ['all', ...new Set(mockRestaurants.map(r => r.category))];
  
  const activeFiltersCount = [
    categoryFilter !== 'all' ? 1 : 0,
    distanceFilter !== 10 ? 1 : 0,
    ratingFilter !== 0 ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <PageHeader 
        title="MYMENU" 
        subtitle="Encontre os melhores restaurantes perto de você"
        icon="🍽️"
      />

      <div className="container mx-auto max-w-6xl px-4 py-6 overflow-visible">
        {/* Barra de Busca e Filtros */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar restaurantes ou categorias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <FilterButton
            activeFiltersCount={activeFiltersCount}
            showFilters={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
            onClearFilters={clearFilters}
          >
            {/* Categoria */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-dark mb-2">Categoria:</h3>
              <div className="flex flex-wrap gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      categoryFilter === cat
                        ? 'bg-primary text-secondary'
                        : 'bg-secondary text-dark hover:bg-secondary/80'
                    }`}
                  >
                    {cat === 'all' ? 'Todas' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Distância */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-dark mb-2">
                Distância: até {distanceFilter} km
              </h3>
              <input
                type="range"
                min="1"
                max="20"
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Avaliação */}
            <div>
              <h3 className="text-xs font-semibold text-dark mb-2">
                Avaliação mínima: {ratingFilter > 0 ? `${ratingFilter} ⭐` : 'Todas'}
              </h3>
              <div className="flex gap-1">
                {[0, 3, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(rating)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      ratingFilter === rating
                        ? 'bg-primary text-secondary'
                        : 'bg-secondary text-dark hover:bg-secondary/80'
                    }`}
                  >
                    {rating === 0 ? 'Todas' : `${rating}+`}
                  </button>
                ))}
              </div>
            </div>
          </FilterButton>
        </div>

        {/* Carrosséis - Apenas quando não há filtros ativos */}
        {!hasActiveFilters && (
          <>
            {/* Carrossel de Promoções */}
            <PromotionsCarousel />

            {/* Carrossel de Destaques */}
            {featuredRestaurants.length > 0 && (
              <FeaturedCarousel restaurants={featuredRestaurants} />
            )}
          </>
        )}

        {/* Lista de Restaurantes */}
        <div>
          <h2 className="text-xl font-bold text-dark mb-4">
            {hasActiveFilters ? 'Resultados da Busca' : 'Todos os Restaurantes'} ({filteredRestaurants.length})
          </h2>
          <div className="space-y-4">
            {filteredRestaurants.length === 0 ? (
              <p className="text-center text-dark/60 py-8">
                Nenhum restaurante encontrado
              </p>
            ) : (
              filteredRestaurants.map((restaurant, index) => (
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
