import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../../components/shared';
import { useFavorites } from '../../contexts/FavoritesContext';
import { mockRestaurants } from '../../lib/mockRestaurants';

export default function TopRated() {
  const { isFavorite, toggleFavorite } = useFavorites();

  // Filtrar apenas restaurantes com rating >= 4.5
  const topRatedRestaurants = mockRestaurants
    .filter(r => r.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating);

  const handleFavoriteClick = (e: React.MouseEvent, restaurantId: string) => {
    e.preventDefault();
    toggleFavorite(restaurantId);
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Melhores Avaliações" 
        subtitle="Restaurantes com as maiores notas"
        icon="⭐"
      />
      
      <div className="container mx-auto max-w-5xl px-4 py-6">
        {/* Filtro de Info */}
        <Card className="mb-8 bg-yellow-50 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-900">⭐ Filtro Aplicado</p>
              <p className="text-xs text-yellow-800">Mostrando restaurantes com nota de 4.5+ ⭐</p>
            </div>
            <p className="text-3xl font-bold text-yellow-900">{topRatedRestaurants.length}</p>
          </div>
        </Card>

        {/* Lista de Restaurantes */}
        {topRatedRestaurants.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">😔 Nenhum restaurante encontrado com essa avaliação</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {topRatedRestaurants.map((restaurant, index) => {
              const favorited = isFavorite(restaurant.id);
              return (
                <Link
                  key={restaurant.id}
                  to={`/restaurante/${restaurant.slug}`}
                  className="block"
                >
                  <Card className="p-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-center gap-4 p-6">
                      {/* Ranking */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-white text-lg flex-shrink-0" style={{ backgroundColor: '#660000' }}>
                        {index + 1}
                      </div>

                      {/* Logo e Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-4xl">{restaurant.logo}</span>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
                            <p className="text-sm text-gray-600">{restaurant.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-700">
                          <span>📍 {restaurant.distance} km</span>
                          <span>🚚 {restaurant.deliveryTime}</span>
                          <span>💰 Média: R$ {(restaurant.rating * 10).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Rating e Favorito */}
                      <div className="text-right flex items-center gap-4 flex-shrink-0">
                        <div>
                          <p className="text-3xl font-bold" style={{ color: '#660000' }}>
                            ⭐ {restaurant.rating}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Excelente</p>
                        </div>
                        <button
                          onClick={(e) => handleFavoriteClick(e, restaurant.id)}
                          className="text-3xl hover:scale-110 transition-transform"
                        >
                          {favorited ? '❤️' : '🤍'}
                        </button>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Insights */}
        <Card className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Por Que Esses Restaurantes?</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-xl">👨‍👩‍👧‍👦</span>
              <div>
                <p className="font-semibold text-gray-800">Confiança do Público</p>
                <p className="text-sm text-gray-600">Estes restaurantes têm as melhores avaliações da comunidade.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🎯</span>
              <div>
                <p className="font-semibold text-gray-800">Qualidade Comprovada</p>
                <p className="text-sm text-gray-600">Todas as compras incluem feedback real de clientes.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🏆</span>
              <div>
                <p className="font-semibold text-gray-800">Destaque Premium</p>
                <p className="text-sm text-gray-600">Estes estabelecimentos se comprometem com excelência.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
