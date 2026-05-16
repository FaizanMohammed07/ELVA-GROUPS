import { UserModel, IUser } from '../models/user.model';
import { AppError } from '../../../utils/appError';
import { PaginationQuery } from '../../../utils/pagination';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  }

  async findByOAuthProvider(provider: string, providerId: string): Promise<IUser | null> {
    return UserModel.findOne({
      oauthProviders: { $elemMatch: { provider, providerId } },
    }).exec();
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    return user.save();
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    const user = await UserModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  async findAll(filter: Record<string, any> = {}, pagination?: PaginationQuery): Promise<IUser[]> {
    const query = UserModel.find(filter);
    if (pagination) {
      query.skip(pagination.skip).limit(pagination.limit).sort(pagination.sort);
    }
    return query.exec();
  }

  async count(filter: Record<string, any> = {}): Promise<number> {
    return UserModel.countDocuments(filter);
  }

  async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } });
  }

  async incrementFailedLogins(id: string): Promise<void> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $inc: { failedLoginAttempts: 1 } },
      { new: true },
    );
    if (user && user.failedLoginAttempts >= 5) {
      await UserModel.findByIdAndUpdate(id, { $set: { isLocked: true } });
    }
  }

  async resetFailedLogins(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $set: { failedLoginAttempts: 0, isLocked: false } });
  }

  async incrementTokenVersion(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } });
  }

  async verifyEmail(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $set: { isEmailVerified: true } });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $set: { passwordHash } });
  }

  async linkOAuthProvider(id: string, provider: string, providerId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      $addToSet: { oauthProviders: { provider, providerId } },
    });
  }

  async addAddress(userId: string, address: any): Promise<IUser> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true },
    );
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  async updateAddress(userId: string, addressId: string, data: any): Promise<IUser> {
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, 'addresses._id': addressId },
      { $set: { 'addresses.$': { ...data, _id: addressId } } },
      { new: true },
    );
    if (!user) throw AppError.notFound('Address not found');
    return user;
  }

  async deleteAddress(userId: string, addressId: string): Promise<IUser> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true },
    );
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  async deactivate(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $set: { isActive: false } });
  }
}
