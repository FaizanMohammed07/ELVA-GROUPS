import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'super_admin' | 'support' | 'marketing' | 'inventory';
  permissions: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  tokenVersion: number;
  lastLoginAt?: Date;
  oauthProviders: Array<{ provider: string; providerId: string }>;
  addresses: Array<IAddress>;
  preferences: IUserPreferences;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface IUserPreferences {
  newsletter: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  pushNotifications: boolean;
  currency: string;
  language: string;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    newsletter: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    whatsappNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, sparse: true, index: true },
    passwordHash: String,
    avatar: String,
    role: {
      type: String,
      enum: ['customer', 'admin', 'super_admin', 'support', 'marketing', 'inventory'],
      default: 'customer',
      index: true,
    },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: Date,
    oauthProviders: [
      {
        provider: { type: String, enum: ['google', 'facebook', 'apple'] },
        providerId: String,
        _id: false,
      },
    ],
    addresses: [AddressSchema],
    preferences: { type: UserPreferencesSchema, default: {} },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ 'oauthProviders.provider': 1, 'oauthProviders.providerId': 1 });

UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Prevent passwordHash from appearing in JSON by default
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
