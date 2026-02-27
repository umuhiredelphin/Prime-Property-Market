export type PropertyType = 'house' | 'land' | 'apartment' | 'office' | 'commercial';
export type PropertyStatus = 'for sale' | 'for rent' | 'sold';
export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  type: PropertyType;
  status: PropertyStatus;
  images: string[]; // JSON parsed
  seller_id: number;
  seller_name?: string;
  seller_email?: string;
  is_approved: number;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  receiver_id: number;
  property_id: number;
  property_title: string;
  content: string;
  created_at: string;
}
