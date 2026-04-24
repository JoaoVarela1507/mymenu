import type { ReactNode } from 'react';
import { useRef, useEffect } from 'react';

interface FilterButtonProps {
  activeFiltersCount: number;
  showFilters: boolean;
  onToggle: () => void;
  onClearFilters: () => void;
  children: ReactNode;
}

export default function FilterButton({ 
  activeFiltersCount, 
  showFilters, 
  onToggle, 
  onClearFilters,
  children
}: FilterButtonProps) {
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        if (showFilters) onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters, onToggle]);

  

  return (
    <div className="relative" ref={filtersRef}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all h-[42px] shadow-md text-white hover:opacity-90`}
        style={{ backgroundColor: '#660000' }}
      >
        <span>🔍</span>
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="bg-white text-primary text-xs px-1.5 py-0.5 rounded-full font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {showFilters && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-dark/20 rounded-lg shadow-lg p-4 w-80 z-10">
          {children}
          
          {/* Botão Limpar Filtros */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-3 border-t border-dark/10">
              <button
                onClick={() => {
                  onClearFilters();
                  onToggle();
                }}
                className="w-full px-3 py-2 bg-dark/5 text-dark rounded-lg text-sm font-medium hover:bg-dark/10 transition-all"
              >
                ❌ Limpar Filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


