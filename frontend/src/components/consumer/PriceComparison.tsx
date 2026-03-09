import type { MenuItem, PriceComparison } from '../../types/restaurant';

interface PriceComparisonProps {
  item: MenuItem;
}

const platformLabels = {
  mymenu: 'MYMENU',
  ifood: 'iFood',
  ubereats: 'Uber Eats',
  rappi: 'Rappi',
};

const platformIcons = {
  mymenu: '🏠',
  ifood: '🍔',
  ubereats: '🚗',
  rappi: '⚡',
};

export default function PriceComparisonComponent({ item }: PriceComparisonProps) {
  const comparisons: PriceComparison[] = Object.entries(item.prices)
    .map(([platform, price]) => ({
      platform: platform as any,
      price: price!,
      isCheapest: false,
      available: true,
    }));

  if (comparisons.length === 0) return null;

  const minPrice = Math.min(...comparisons.map(c => c.price));
  comparisons.forEach(c => {
    c.isCheapest = c.price === minPrice;
  });

  const cheapest = comparisons.find(c => c.isCheapest)!;

  return (
    <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
      <h4 className="text-sm font-semibold text-dark mb-3">💰 Comparação de Preços</h4>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {comparisons.map(comp => (
          <div
            key={comp.platform}
            className={`p-3 rounded-lg border-2 ${
              comp.isCheapest
                ? 'bg-status-pronto/10 border-status-pronto'
                : 'bg-white border-dark/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{platformIcons[comp.platform]}</span>
              <span className="text-xs font-medium text-dark">
                {platformLabels[comp.platform]}
              </span>
            </div>
            <p className="text-lg font-bold text-dark">
              R$ {comp.price.toFixed(2)}
            </p>
            {comp.isCheapest && (
              <span className="text-xs text-status-pronto font-semibold">
                ✓ Melhor preço
              </span>
            )}
          </div>
        ))}
      </div>

      <a
        href={`https://${cheapest.platform}.com.br`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-primary text-secondary text-center py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all"
      >
        Pedir no {platformLabels[cheapest.platform]} por R$ {cheapest.price.toFixed(2)}
      </a>
    </div>
  );
}
