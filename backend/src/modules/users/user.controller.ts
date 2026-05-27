import { Request, Response } from 'express';
import { UserRepository } from './repositories/user.repository';
import { UserModel, IUserPreferences } from './models/user.model';
import { sendSuccess } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/pagination';
import { buildPaginationMeta } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';

const userRepo = new UserRepository();

export const UserController = {
  async getMe(req: Request, res: Response): Promise<void> {
    const user = await userRepo.findById(req.user!.id);
    if (!user) throw AppError.notFound('User not found');
    sendSuccess(res, user, 'Profile fetched');
  },

  async updateMe(req: Request, res: Response): Promise<void> {
    const { name, phone, avatar } = req.body;
    // Validate avatar is a safe HTTPS URL (prevent javascript:/data: XSS vectors)
    if (avatar !== undefined && avatar !== null) {
      try {
        const u = new URL(avatar);
        if (u.protocol !== 'https:') throw new Error();
      } catch {
        throw AppError.badRequest('avatar must be a valid HTTPS URL');
      }
    }
    // Validate phone format for Indian numbers
    if (phone !== undefined && phone !== null && !/^[6-9]\d{9}$/.test(String(phone))) {
      throw AppError.badRequest('phone must be a valid 10-digit Indian mobile number');
    }
    const user = await userRepo.update(req.user!.id, {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
    });
    sendSuccess(res, user, 'Profile updated');
  },

  async getPublicProfile(req: Request, res: Response): Promise<void> {
    const user = await userRepo.findById(req.params["id"] as string);
    if (!user) throw AppError.notFound('User not found');
    sendSuccess(res, { name: user.name, avatar: user.avatar }, 'Profile fetched');
  },

  async getAddresses(req: Request, res: Response): Promise<void> {
    const user = await userRepo.findById(req.user!.id);
    sendSuccess(res, user?.addresses || [], 'Addresses fetched');
  },

  async addAddress(req: Request, res: Response): Promise<void> {
    const user = await userRepo.addAddress(req.user!.id, req.body);
    sendSuccess(res, user.addresses, 'Address added');
  },

  async updateAddress(req: Request, res: Response): Promise<void> {
    const user = await userRepo.updateAddress(req.user!.id, req.params["addressId"] as string, req.body);
    sendSuccess(res, user.addresses, 'Address updated');
  },

  async deleteAddress(req: Request, res: Response): Promise<void> {
    const user = await userRepo.deleteAddress(req.user!.id, req.params["addressId"] as string);
    sendSuccess(res, user.addresses, 'Address removed');
  },

  async setDefaultAddress(req: Request, res: Response): Promise<void> {
    const addressId = req.params["addressId"] as string;
    await UserModel.findByIdAndUpdate(req.user!.id, {
      $set: { 'addresses.$[].isDefault': false },
    });
    await UserModel.findOneAndUpdate(
      { _id: req.user!.id, 'addresses._id': addressId },
      { $set: { 'addresses.$.isDefault': true } },
    );
    const user = await userRepo.findById(req.user!.id);
    sendSuccess(res, user?.addresses || [], 'Default address updated');
  },

  async updatePreferences(req: Request, res: Response): Promise<void> {
    const { newsletter, smsNotifications, whatsappNotifications, pushNotifications, language, currency } = req.body;
    const existing = (await userRepo.findById(req.user!.id))?.preferences ?? {} as IUserPreferences;
    const preferences: IUserPreferences = {
      newsletter: newsletter !== undefined ? Boolean(newsletter) : existing.newsletter,
      smsNotifications: smsNotifications !== undefined ? Boolean(smsNotifications) : existing.smsNotifications,
      whatsappNotifications: whatsappNotifications !== undefined ? Boolean(whatsappNotifications) : existing.whatsappNotifications,
      pushNotifications: pushNotifications !== undefined ? Boolean(pushNotifications) : existing.pushNotifications,
      language: language !== undefined ? String(language).slice(0, 10) : existing.language,
      currency: currency !== undefined ? String(currency).slice(0, 5) : existing.currency,
    };
    const user = await userRepo.update(req.user!.id, { preferences });
    sendSuccess(res, user.preferences, 'Preferences updated');
  },

  async getMyOrders(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, [], 'Orders fetched');
  },

  async getMySessions(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, [], 'Sessions fetched');
  },

  async revokeSession(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, null, 'Session revoked');
  },

  // Admin
  async listUsers(req: Request, res: Response): Promise<void> {
    const pagination = parsePagination(req);
    const filter: Record<string, any> = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const [users, total] = await Promise.all([
      userRepo.findAll(filter, pagination),
      userRepo.count(filter),
    ]);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
    sendSuccess(res, users, 'Users fetched', 200, meta);
  },

  async getUserById(req: Request, res: Response): Promise<void> {
    const user = await userRepo.findById(req.params["id"] as string);
    if (!user) throw AppError.notFound('User not found');
    sendSuccess(res, user, 'User fetched');
  },

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    const user = await userRepo.findById(req.params["id"] as string);
    if (!user) throw AppError.notFound('User not found');
    await userRepo.update(req.params["id"] as string, { isActive: !user.isActive });
    sendSuccess(res, null, `User ${user.isActive ? 'deactivated' : 'activated'}`);
  },

  async updateUserRole(req: Request, res: Response): Promise<void> {
    const user = await userRepo.update(req.params["id"] as string, { role: req.body.role });
    sendSuccess(res, user, 'User role updated');
  },

  async deleteUser(req: Request, res: Response): Promise<void> {
    await userRepo.deactivate(req.params["id"] as string);
    sendSuccess(res, null, 'User deactivated');
  },
};

