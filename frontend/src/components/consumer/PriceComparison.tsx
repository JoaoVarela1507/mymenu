import type { MenuItem } from '../../types/restaurant';

interface PriceComparisonProps {
  item: MenuItem;
}

export default function PriceComparisonComponent({ item }: PriceComparisonProps) {
  return (
    <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-dark">Preço no MyMenu</span>
        <span className="text-lg font-bold text-primary">R$ {item.price.toFixed(2)}</span>
      </div>
    </div>
  );
}
