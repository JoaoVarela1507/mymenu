import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'order';
  statusColor?: string;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export default function Card({ 
  children, 
  variant = 'default', 
  statusColor,
  className = '',
  onClick,
  style
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
      style={{ ...borderStyle, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

