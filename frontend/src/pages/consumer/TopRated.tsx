import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../../components/shared';
import { useFavorites } from '../../contexts/FavoritesContext';
import { getRestaurants } from '../../lib/firestoreService';
import type { Restaurant } from '../../types/restaurant';

export default function TopRated() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants().then(all => {
      setRestaurants(all.sort((a, b) => b.rating - a.rating));
      setLoading(false);
    });
  }, []);

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
        {loading ? (
          <p className="text-center text-gray-400 py-16">Carregando...</p>
        ) : restaurants.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum restaurante encontrado</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {restaurants.map((restaurant, index) => {
              const favorited = isFavorite(restaurant.id);
              return (
                <Link key={restaurant.id} to={`/restaurante/${restaurant.slug}`} className="block">
                  <Card className="p-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-center gap-4 p-6">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-white text-lg flex-shrink-0" style={{ backgroundColor: '#660000' }}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-4xl">{restaurant.logo}</span>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
                            <p className="text-sm text-gray-600">{restaurant.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-700">
                          <span>📍 {restaurant.city || restaurant.address || '—'}</span>
                          <span>🕐 {restaurant.openTime && restaurant.closeTime ? `${restaurant.openTime}–${restaurant.closeTime}` : restaurant.deliveryTime}</span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4 flex-shrink-0">
                        <div>
                          <p className="text-3xl font-bold" style={{ color: '#660000' }}>
                            ⭐ {restaurant.rating > 0 ? restaurant.rating : '—'}
                          </p>
                        </div>
                        <button onClick={(e) => handleFavoriteClick(e, restaurant.id)} className="text-3xl hover:scale-110 transition-transform">
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
      </div>
    </div>
  );
}
