import { Link } from 'react-router-dom';
import type { Restaurant } from '../../types/restaurant';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useRef, useState, useEffect } from 'react';

interface FeaturedCarouselProps {
  restaurants: Restaurant[];
}

export default function FeaturedCarousel({ restaurants }: FeaturedCarouselProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFavoriteClick = (e: React.MouseEvent, restaurantId: string) => {
    e.preventDefault();
    toggleFavorite(restaurantId);
  };

  const duplicatedRestaurants = [...restaurants, ...restaurants, ...restaurants];

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 240;
    const newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
    const actualIndex = ((newIndex % restaurants.length) + restaurants.length) % restaurants.length;
    setCurrentIndex(actualIndex);
    scrollRef.current.scrollTo({ left: (actualIndex + restaurants.length) * cardWidth, behavior: 'smooth' });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY * 0.5;
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };

    element.addEventListener('wheel', preventScroll, { passive: false });
    return () => element.removeEventListener('wheel', preventScroll);
  }, []);

  return (
    <div className="mb-4 relative">
      <h2 className="text-2xl font-bold text-dark mb-4 flex items-center gap-2">
        <span>✨</span>
        Restaurantes em Destaque
      </h2>
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="overflow-hidden rounded-lg">
          <div 
            ref={scrollRef} 
            onWheel={handleWheel} 
            className="flex gap-4 overflow-x-hidden pb-4"
            style={{ overscrollBehavior: 'contain' }}
          >
        {duplicatedRestaurants.map((restaurant, index) => {
          const favorited = isFavorite(restaurant.id);
          return (
            <Link
              key={`${restaurant.id}-${index}`}
              to={`/restaurante/${restaurant.slug}`}
              className="flex-shrink-0 w-56 bg-gradient-to-br from-primary/5 to-secondary/30 border-2 border-primary/20 rounded-xl p-4 hover:shadow-xl hover:border-primary/40 transition-all relative"
            >
              <button
                onClick={(e) => handleFavoriteClick(e, restaurant.id)}
                className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform z-10"
              >
                {favorited ? '❤️' : '🤍'}
              </button>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl">{restaurant.logo}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-dark truncate">{restaurant.name}</h3>
                </div>
              </div>
              <div className="text-xs text-dark/60">
                <span>📍 {restaurant.distance} km</span>
              </div>
            </Link>
          );
        })}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-secondary/20 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-secondary/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
