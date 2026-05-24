import { useState, useEffect } from 'react';
import { getRestaurants } from '../../lib/firestoreService';
import type { Restaurant } from '../../types/restaurant';
import RestaurantCard from '../../components/consumer/RestaurantCard';
import { PageHeader, EmptyState } from '../../components/shared';

export default function Nearby() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants().then(all => {
      setRestaurants(all.sort((a, b) => a.distance - b.distance));
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-secondary/20">
      <PageHeader
        title="Restaurantes Próximos"
        subtitle="Encontre restaurantes perto de você"
        icon="📍"
      />

      <div className="container mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          <p className="text-center text-gray-400 py-16">Carregando...</p>
        ) : restaurants.length === 0 ? (
          <EmptyState message="Nenhum restaurante encontrado" icon="📍" />
        ) : (
          <div>
            <p className="text-dark/60 mb-4">{restaurants.length} restaurante(s) encontrado(s)</p>
            <div className="space-y-4">
              {restaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
