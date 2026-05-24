import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Restaurant } from '../../types/restaurant';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import LoginPromptModal from '../shared/LoginPromptModal';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const favorited = isFavorite(restaurant.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    toggleFavorite(restaurant.id);
  };

  return (
    <>
    <Link to={`/restaurante/${restaurant.slug}`}>
      <div className="bg-white border border-dark/10 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer relative">
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 text-2xl hover:scale-110 transition-transform z-10"
          title={isAuthenticated ? (favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos') : 'Faça login para favoritar'}
        >
          {isAuthenticated ? (favorited ? '❤️' : '🤍') : '🔒'}
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
              <span>⭐ {restaurant.rating > 0 ? restaurant.rating : '—'}</span>
              <span>📍 {restaurant.city || restaurant.address || '—'}</span>
              <span>🕐 {restaurant.openTime && restaurant.closeTime ? `${restaurant.openTime}–${restaurant.closeTime}` : restaurant.deliveryTime}</span>
            </div>

            <div className="flex items-center justify-between">
              {isAuthenticated ? (
                <span className="text-sm text-dark/60">
                  Pedido mínimo: R$ {restaurant.minOrder.toFixed(2)}
                </span>
              ) : (
                <span
                  className="text-sm text-gray-400 flex items-center gap-1 cursor-pointer hover:text-[#C92924]"
                  onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }}
                >
                  🔒 <span className="underline decoration-dotted">Faça login para ver preços</span>
                </span>
              )}
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

    <LoginPromptModal
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      message="Faça login para ver preços e favoritar restaurantes."
    />
    </>
  );
}
