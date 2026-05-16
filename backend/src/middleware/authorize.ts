import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

// RBAC — role-based
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw AppError.unauthorized();
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden(`Role '${req.user.role}' is not authorized for this action`);
    }
    next();
  };
};

// ABAC — permission-based
export const requirePermission = (...permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw AppError.unauthorized();
    const hasAll = permissions.every((p) => req.user!.permissions.includes(p));
    if (!hasAll) {
      throw AppError.forbidden('Insufficient permissions');
    }
    next();
  };
};

// Combined: role OR permission
export const requireAny = (roles: string[] = [], permissions: string[] = []) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw AppError.unauthorized();
    const hasRole = roles.includes(req.user.role);
    const hasPermission = permissions.some((p) => req.user!.permissions.includes(p));
    if (!hasRole && !hasPermission) {
      throw AppError.forbidden('Access denied');
    }
    next();
  };
};

// Super admin only
export const requireSuperAdmin = requireRole('super_admin');

// Admin or super admin
export const requireAdmin = requireRole('admin', 'super_admin');

// Customer (logged in user)
export const requireCustomer = requireRole('customer', 'admin', 'super_admin');
