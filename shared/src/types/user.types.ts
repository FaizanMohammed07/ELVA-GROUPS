export type UserRole = 'customer' | 'admin' | 'super_admin' | 'support' | 'marketing' | 'inventory';

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface IAddress {
  _id?: string;
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  permissions: string[];
  isEmailVerified: boolean;
  addresses?: IAddress[];
  loyaltyTier?: LoyaltyTier;
  loyaltyPoints?: number;
  referralCode?: string;
  createdAt: string;
}

export interface ILoyalty {
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  updatedAt: string;
}

export interface ILoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus';
  points: number;
  description: string;
  orderId?: string;
  createdAt: string;
}
