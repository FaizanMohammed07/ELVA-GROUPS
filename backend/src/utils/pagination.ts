import { Request } from 'express';

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
}

export const parsePagination = (req: Request, maxLimit = 100): PaginationQuery => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const skip = (page - 1) * limit;

  const sortField = String(req.query.sortBy || 'createdAt');
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortOrder } as Record<string, 1 | -1>;

  return { page, limit, skip, sort };
};
