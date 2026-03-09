import { useState } from 'react';
import type { Order, OrderStatus } from '../../types';
import { Card, Badge, Button } from '../shared';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const statusColors: Record<OrderStatus, string> = {
  novo: '#C92924',
  aceito: '#FF9800',
  preparo: '#2196F3',
  pronto: '#4CAF50',
  finalizado: '#9E9E9E',
  cancelado: '#F44336',
};

const sourceColors: Record<string, string> = {
  ifood: '#EA1D2C', // Vermelho iFood
  ubereats: '#00A8FF', // Azul Uber Eats
  rappi: '#00D68F', // Verde Rappi
};

const sourceLabels: Record<string, string> = {
  ifood: 'iFood',
  ubereats: 'Uber Eats',
  rappi: 'Rappi',
};

const sourceIcons: Record<string, string> = {
  ifood: '🍔',
  ubereats: '🚗',
  rappi: '⚡',
};

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getNextStatus = (): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      novo: 'aceito',
      aceito: 'preparo',
      preparo: 'pronto',
      pronto: 'finalizado',
      finalizado: null,
      cancelado: null,
    };
    return flow[order.status];
  };

  const nextStatus = getNextStatus();

  return (
    <Card 
      variant="order" 
      statusColor={sourceColors[order.source]} 
      className="mb-2 cursor-pointer transition-all duration-300 hover:shadow-md transform hover:scale-[1.01]"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Versão Compacta */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-bold text-dark">{order.orderNumber}</h3>
            <p className="text-xs text-dark/60">
              {sourceIcons[order.source]} {sourceLabels[order.source]} • {order.createdAt}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={order.status} className="text-xs px-2 py-1">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          <p className="text-lg font-bold text-primary">
            R$ {order.total.toFixed(2).replace('.', ',')}
          </p>
          <span className={`text-dark/40 text-sm transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`}>
            ▶
          </span>
        </div>
      </div>

      {/* Versão Expandida com Animação */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
      }`}>
        <div className="pt-3 border-t border-dark/10" onClick={(e) => e.stopPropagation()}>
          <div className="mb-3">
            <p className="text-xs text-dark/60 mb-2">Cliente: {order.customerName}</p>
            {order.estimatedTime && (
              <p className="text-xs text-primary font-semibold mb-2">
                ⏱️ Tempo estimado: {order.estimatedTime} min
              </p>
            )}
            <div className="space-y-1">
              {order.items.map((item, index) => (
                <p key={index} className={`text-sm text-dark transform transition-all duration-200 ${
                  isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`} style={{ transitionDelay: `${index * 50}ms` }}>
                  {item.quantity}x {item.name}
                </p>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {order.status === 'novo' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onStatusChange(order.id, 'cancelado')}
                  className="text-xs px-3 py-1 transition-all duration-200 hover:scale-105"
                >
                  Rejeitar
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onStatusChange(order.id, 'aceito')}
                  className="text-xs px-3 py-1 transition-all duration-200 hover:scale-105"
                >
                  Aceitar
                </Button>
              </>
            )}
            {nextStatus && order.status !== 'novo' && (
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => onStatusChange(order.id, nextStatus)}
                className="text-xs px-3 py-1 transition-all duration-200 hover:scale-105"
              >
                Avançar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
