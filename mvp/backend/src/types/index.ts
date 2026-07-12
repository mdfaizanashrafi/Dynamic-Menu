import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  restaurant_name: string;
  slug: string;
  created_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  sort_order: number;
}

export interface Item {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  available: number;
}

export interface MenuCategory extends Category {
  items: Item[];
}
