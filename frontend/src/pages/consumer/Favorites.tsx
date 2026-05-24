import { useState, useEffect } from 'react';
import { getRestaurants } from '../../lib/firestoreService';
import type { Restaurant } from '../../types/restaurant';
import { useFavorites } from '../../contexts/FavoritesContext';
import RestaurantCard from '../../components/consumer/RestaurantCard';
import { PageHeader, EmptyState } from '../../components/shared';

export default function Favorites() {
  const { favorites } = useFavorites();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants().then(all => {
      setRestaurants(all);
      setLoading(false);
    });
  }, []);

  const favoriteRestaurants = restaurants.filter(r => favorites.includes(r.id));

  return (
    <div className="min-h-screen bg-secondary/20">
      <PageHeader
        title="Meus Favoritos"
        subtitle="Restaurantes que você marcou como favoritos"
        icon="❤️"
      />

      <div className="container mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          <p className="text-center text-gray-400 py-16">Carregando...</p>
        ) : favoriteRestaurants.length === 0 ? (
          <EmptyState
            message="Você ainda não tem favoritos"
            submessage="Clique no ❤️ nos restaurantes para adicioná-los aqui"
            icon="❤️"
          />
        ) : (
          <div className="space-y-4">
            {favoriteRestaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
