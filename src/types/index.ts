export interface FoodItem {
  id: string;
  name: string;
  type: 'fruit' | 'vegetable' | 'packaged' | 'other';
  expiryDate: string;
  addedAt: string;
  status: 'fresh' | 'spoiling' | 'spoilt';
  quantity: string;
  notes?: string;
  userId: string;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  quantity: string;
  location: string;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  type: 'animal-feed' | 'fertilizer' | 'any';
  status: 'available' | 'reserved' | 'completed';
  price: string;
  imageUrl?: string;
}

export interface SensorData {
  id: string;
  deviceId: string;
  timestamp: string;
  gasLevel: number; // For detecting spoilage (e.g., ethylene or ammonia)
  temperature: number;
  humidity: number;
  status: 'normal' | 'warning' | 'critical';
  userId: string;
}
