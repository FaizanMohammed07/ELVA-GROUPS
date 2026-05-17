import { Request, Response } from 'express';
import slugify from 'slugify';
import { CategoryModel } from './models/category.model';
import { ProductRepository } from '../products/repositories/product.repository';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';

const productRepo = new ProductRepository();

export const CategoryController = {
  async list(_req: Request, res: Response): Promise<void> {
    const categories = await CategoryModel.find({ isActive: true }).sort({ order: 1 }).exec();
    sendSuccess(res, categories, 'Categories fetched');
  },

  async getFeatured(_req: Request, res: Response): Promise<void> {
    const categories = await CategoryModel.find({ isActive: true, isFeatured: true })
      .sort({ order: 1 })
      .exec();
    sendSuccess(res, categories, 'Featured categories');
  },

  async getTree(_req: Request, res: Response): Promise<void> {
    const categories = await CategoryModel.find({ isActive: true }).sort({ order: 1 }).lean();
    const roots = categories.filter((c) => !c.parentId);
    const buildTree = (parent: any): any => ({
      ...parent,
      children: categories
        .filter((c) => c.parentId?.toString() === parent._id.toString())
        .map(buildTree),
    });
    sendSuccess(res, roots.map(buildTree), 'Category tree');
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const category = await CategoryModel.findOne({ slug: req.params["slug"] as string, isActive: true });
    if (!category) throw AppError.notFound('Category not found');
    sendSuccess(res, category, 'Category fetched');
  },

  async getProducts(req: Request, res: Response): Promise<void> {
    const products = await productRepo.findByCategory(req.params["id"] as string);
    sendSuccess(res, products, 'Category products');
  },

  async create(req: Request, res: Response): Promise<void> {
    const slug = slugify(req.body.name, { lower: true, strict: true });
    const category = await CategoryModel.create({ ...req.body, slug });
    sendCreated(res, category, 'Category created');
  },

  async update(req: Request, res: Response): Promise<void> {
    if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    const category = await CategoryModel.findByIdAndUpdate(
      req.params["id"] as string,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!category) throw AppError.notFound('Category not found');
    sendSuccess(res, category, 'Category updated');
  },

  async toggleStatus(req: Request, res: Response): Promise<void> {
    const category = await CategoryModel.findById(req.params["id"] as string);
    if (!category) throw AppError.notFound('Category not found');
    category.isActive = !category.isActive;
    await category.save();
    sendSuccess(res, category, 'Status toggled');
  },

  async delete(req: Request, res: Response): Promise<void> {
    await CategoryModel.findByIdAndDelete(req.params["id"] as string);
    sendSuccess(res, null, 'Category deleted');
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { order } = req.body as { order: Array<{ id: string; order: number }> };
    await Promise.all(
      order.map(({ id, order: o }) => CategoryModel.findByIdAndUpdate(id, { $set: { order: o } })),
    );
    sendSuccess(res, null, 'Order updated');
  },
};
