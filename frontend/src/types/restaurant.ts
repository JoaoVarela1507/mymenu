export type RestaurantPlan = 'diamante' | 'ouro' | 'prata' | 'basico';
export type Platform = 'mymenu' | 'ifood' | 'ubereats' | 'rappi';

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  logo: string;
  plan: RestaurantPlan;
  rating: number;
  category: string;
  distance: number;
  isOpen: boolean;
  deliveryTime: string;
  minOrder: number;
  headerColor?: string; // Cor personalizável do header (hex)
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  ingredients?: string;
  image: string;
  categoryId: string;
  prices: {
    mymenu?: number;
    ifood?: number;
    ubereats?: number;
    rappi?: number;
  };
  exclusive?: 'delivery' | 'presencial';
  available: boolean;
  allergens?: ('gluten' | 'dairy' | 'eggs' | 'nuts' | 'soy' | 'fish' | 'shellfish')[];
}

export interface PriceComparison {
  platform: Platform;
  price: number;
  isCheapest: boolean;
  available: boolean;
}
