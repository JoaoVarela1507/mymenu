import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../../components/shared';
import { mockMenuItems } from '../../lib/mockMenu';
import { mockRestaurants } from '../../lib/mockRestaurants';

export default function Offers() {
  const mockOffers = mockMenuItems
    .filter(item => item.isOffer && item.offerPrice)
    .map(item => {
      const restaurant = mockRestaurants.find(r => r.id === item.restaurantId);
      const originalPrice = Object.values(item.prices).find(price => typeof price === 'number') || 0;
      const offerPrice = item.offerPrice || 0;
      const discount = originalPrice > 0 ? `${Math.round(((originalPrice - offerPrice) / originalPrice) * 100)}%` : '0%';

      return {
        id: item.id,
        restaurant: restaurant?.name || 'Restaurante',
        restaurantLogo: restaurant?.logo || '🍽️',
        restaurantSlug: restaurant?.slug || '#',
        dish: item.name,
        originalPrice,
        offerPrice,
        discount,
        image: item.image || '🍽️',
        description: item.description || '',
        validUntil: '30/04/2026',
      };
    });

  const calculateSavings = (original: number, offer: number) => {
    return (original - offer).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Ofertas Especiais" 
        subtitle="Pratos em destaque com preços imperdíveis"
        icon="🎁"
      />
      
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* Banner de Oferta */}
        <Card className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-l-4" style={{ borderLeftColor: '#660000' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🔥 Ofertas Imperdíveis!</h2>
              <p className="text-gray-700">Aproveite pratos selecionados com descontos exclusivos</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total de Ofertas</p>
              <p className="text-4xl font-bold" style={{ color: '#660000' }}>{mockOffers.length}</p>
            </div>
          </div>
        </Card>

        {/* Filtros */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors">
            🔥 Maiores Descontos
          </button>
          <button className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
            ⏰ Expirando em Breve
          </button>
          <button className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
            📍 Perto de Você
          </button>
        </div>

        {/* Grid de Ofertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockOffers.map((offer) => {
            const savings = calculateSavings(offer.originalPrice, offer.offerPrice);
            return (
              <Link
                key={offer.id}
                to={`/restaurante/${offer.restaurantSlug}`}
                className="block"
              >
                <Card className="p-0 overflow-hidden hover:shadow-2xl transition-all h-full cursor-pointer relative">
                  {/* Badge de Desconto */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center flex-col">
                      <p className="font-bold text-lg">-{offer.discount}</p>
                      <p className="text-xs">OFF</p>
                    </div>
                  </div>

                  {/* Imagem/Emoji */}
                  <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-8 flex items-center justify-center text-6xl h-40">
                    {offer.image}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4">
                    {/* Restaurante */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{offer.restaurantLogo}</span>
                      <p className="text-xs font-semibold text-gray-600">{offer.restaurant}</p>
                    </div>

                    {/* Nome do Prato */}
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{offer.dish}</h3>

                    {/* Descrição */}
                    <p className="text-sm text-gray-600 mb-4">{offer.description}</p>

                    {/* Preços */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-600 mb-1">Preço Original</p>
                      <p className="text-sm line-through text-gray-500 mb-2">R$ {offer.originalPrice.toFixed(2)}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold" style={{ color: '#660000' }}>R$ {offer.offerPrice.toFixed(2)}</p>
                        <p className="text-xs text-green-600 font-semibold">Economize R$ {savings}</p>
                      </div>
                    </div>

                    {/* Validade */}
                    <p className="text-xs text-gray-600 mb-4">⏰ Válida até {offer.validUntil}</p>

                    {/* Botão */}
                    <button className="w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors" style={{ backgroundColor: '#660000' }}>
                      Aproveitar Oferta
                    </button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Sobre Ofertas */}
        <Card className="bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Como Funcionam as Ofertas?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold text-gray-800 mb-2">🎯 Exclusivas</p>
              <p className="text-sm text-gray-700">Ofertas especiais selecionadas pelos restaurantes parceiros.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">⏰ Por Tempo Limitado</p>
              <p className="text-sm text-gray-700">Cada oferta tem uma data de validade. Aproveite enquanto disponível!</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">💰 Economize</p>
              <p className="text-sm text-gray-700">Descontos exclusivos para nossos clientes mais engajados.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
