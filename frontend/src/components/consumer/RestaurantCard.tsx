import { Link } from 'react-router-dom';
import type { Restaurant } from '../../types/restaurant';
import { useFavorites } from '../../contexts/FavoritesContext';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(restaurant.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(restaurant.id);
  };

  return (
    <Link to={`/restaurante/${restaurant.slug}`}>
      <div className="bg-white border border-dark/10 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer relative">
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 text-2xl hover:scale-110 transition-transform z-10"
          title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          {favorited ? '❤️' : '🤍'}
        </button>
        <div className="flex gap-4">
          <div className="text-6xl">{restaurant.logo}</div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-dark">{restaurant.name}</h3>
                <p className="text-sm text-dark/60">{restaurant.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-dark/70 mb-2">
              <span>⭐ {restaurant.rating}</span>
              <span>📍 {restaurant.distance} km</span>
              <span>🕐 {restaurant.deliveryTime}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-dark/60">
                Pedido mínimo: R$ {restaurant.minOrder.toFixed(2)}
              </span>
              <span className={`text-sm font-semibold ${
                restaurant.isOpen ? 'text-status-pronto' : 'text-status-cancelado'
              }`}>
                {restaurant.isOpen ? '🟢 Aberto' : '🔴 Fechado'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
