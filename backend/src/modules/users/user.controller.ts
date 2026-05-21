import { Request, Response } from 'express';
import { UserRepository } from './repositories/user.repository';
import { UserModel } from './models/user.model';
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
    const user = await userRepo.update(req.user!.id, { name, phone, avatar });
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
    const user = await userRepo.update(req.user!.id, { preferences: req.body });
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

