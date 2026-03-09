import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'novo' | 'aceito' | 'preparo' | 'pronto' | 'finalizado' | 'cancelado' | 'delivery' | 'presencial';
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'novo',
  className = '' 
}: BadgeProps) {
  const variants = {
    novo: 'bg-status-novo text-white',
    aceito: 'bg-status-aceito text-white',
    preparo: 'bg-status-preparo text-white',
    pronto: 'bg-status-pronto text-white',
    finalizado: 'bg-status-finalizado text-white',
    cancelado: 'bg-status-cancelado text-white',
    delivery: 'bg-primary text-secondary',
    presencial: 'bg-dark text-secondary',
  };

  return (
    <span 
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}
