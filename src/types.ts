export type PropertyType = 'house' | 'land' | 'apartment' | 'office' | 'commercial';
export type PropertyStatus = 'for sale' | 'for rent' | 'sold';
export type UserRole = 'buyer' | 'seller' | 'admin';

export type UserStatus = 'active' | 'blocked';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  id_number?: string;
  id_image?: string;
  selfie_image?: string;
  is_verified: boolean;
  role: UserRole;
  status: UserStatus;
  created_at: string;
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
  phone_contact: string;
  is_approved: number;
  is_featured: number;
  created_at: string;
  
  // House specific
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  has_garden?: boolean;
  floors?: number;
  
  // Land specific
  land_size?: number;
  zoning_type?: string;
  has_road_access?: boolean;
  
  // Commercial specific
  office_space?: number;
  parking_capacity?: number;
  business_type_allowed?: string;
}

export interface Payment {
  id: number;
  user_id: number;
  user_name: string;
  property_id: number;
  property_title: string;
  amount: number;
  type: 'promotion' | 'subscription';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Report {
  id: number;
  property_id: number;
  property_title: string;
  user_id: number;
  user_name: string;
  reason: string;
  created_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
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
