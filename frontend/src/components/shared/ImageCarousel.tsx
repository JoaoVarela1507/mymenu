import { useState, useEffect } from 'react';

interface ImageCarouselProps {
  images?: string[];
  autoPlayInterval?: number;
}

export default function ImageCarousel({ 
  images = [
    '/assets/imagem.png',
    '/assets/imagem_fundo1.png',
    '/assets/imagem_fundo2.png',
    '/assets/imagem_fundo3.png',
    '/assets/imagem_fundo4.png'
  ],
  autoPlayInterval = 5000 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval]);

  

  

  

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Imagens */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Overlay escuro */}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        ))}
      </div>


    </div>
  );
}


