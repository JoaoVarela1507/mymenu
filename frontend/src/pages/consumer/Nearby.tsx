import { useState } from 'react';
import { mockRestaurants } from '../../lib/mockRestaurants';
import RestaurantCard from '../../components/consumer/RestaurantCard';
import { PageHeader, EmptyState } from '../../components/shared';

export default function Nearby() {
  const [maxDistance, setMaxDistance] = useState(5);

  const nearbyRestaurants = mockRestaurants
    .filter(r => r.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="min-h-screen bg-secondary/20">
      <PageHeader 
        title="Restaurantes Próximos" 
        subtitle="Encontre restaurantes perto de você"
        icon="📍"
      />

      <div className="container mx-auto max-w-6xl px-4 py-6">

        <div className="mb-6 max-w-md">
          <label className="block text-sm font-medium text-dark mb-2">
            Distância máxima: {maxDistance} km
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-dark/60 mt-1">
            <span>0.5 km</span>
            <span>10 km</span>
          </div>
        </div>

        {nearbyRestaurants.length === 0 ? (
          <EmptyState 
            message="Nenhum restaurante encontrado nesta distância"
            icon="📍"
          />
        ) : (
          <div>
            <p className="text-dark/60 mb-4">
              {nearbyRestaurants.length} restaurante(s) encontrado(s)
            </p>
            <div className="space-y-4">
              {nearbyRestaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
