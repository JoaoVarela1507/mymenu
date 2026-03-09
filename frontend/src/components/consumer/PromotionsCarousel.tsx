import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface PromoCard {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  action: () => void;
}

export default function PromotionsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const promoCards: PromoCard[] = [
    {
      id: '1',
      title: 'Melhores Ofertas',
      subtitle: 'Restaurantes com os melhores preços perto de você',
      emoji: '🔥',
      gradient: 'from-orange-400 via-red-500 to-pink-500',
      action: () => navigate('/?filter=best-prices')
    },
    {
      id: '2',
      title: 'Cupons de Desconto',
      subtitle: 'Economize com cupons exclusivos',
      emoji: '🎟️',
      gradient: 'from-purple-400 via-pink-500 to-red-500',
      action: () => navigate('/?filter=coupons')
    },
    {
      id: '3',
      title: 'Entrega Grátis',
      subtitle: 'Restaurantes com frete grátis hoje',
      emoji: '🚚',
      gradient: 'from-green-400 via-teal-500 to-blue-500',
      action: () => navigate('/?filter=free-delivery')
    }
  ];

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollRef.current.scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="mb-8 -mx-4 px-4">
      {/* Carrossel */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {promoCards.map((card) => (
          <div
            key={card.id}
            className="flex-shrink-0 w-full snap-center px-1"
          >
            <button
              onClick={card.action}
              className={`w-full h-48 bg-gradient-to-r ${card.gradient} rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group`}
            >
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
              
              {/* Conteúdo */}
              <div className="relative z-10 h-full flex flex-col justify-center items-start">
                <span className="text-6xl mb-4 animate-bounce">{card.emoji}</span>
                <h3 className="text-3xl font-bold mb-2 drop-shadow-lg">{card.title}</h3>
                <p className="text-lg text-white/90 drop-shadow">{card.subtitle}</p>
              </div>

              {/* Decoração */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            </button>
          </div>
        ))}
      </div>

      {/* Indicadores (bolinhas) */}
      <div className="flex justify-center gap-2 mt-4">
        {promoCards.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === index
                ? 'w-8 h-3 bg-primary'
                : 'w-3 h-3 bg-dark/30 hover:bg-dark/50'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
