import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'order';
  statusColor?: string;
  className?: string;
  onClick?: () => void;
}

export default function Card({ 
  children, 
  variant = 'default', 
  statusColor,
  className = '',
  onClick
}: CardProps) {
  const baseStyles = 'rounded-xl p-5 shadow-sm';
  
  const variants = {
    default: 'bg-secondary border border-dark/10',
    order: 'bg-white border-l-4',
  };

  const borderStyle = variant === 'order' && statusColor 
    ? { borderLeftColor: statusColor } 
    : {};

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={borderStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
