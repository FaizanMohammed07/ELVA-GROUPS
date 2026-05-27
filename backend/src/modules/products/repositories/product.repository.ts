import { ProductModel, IProduct } from '../models/product.model';
import { AppError } from '../../../utils/appError';
import { PaginationQuery } from '../../../utils/pagination';

export interface ProductFilter {
  status?: string; // 'all' = no status filter
  categoryIds?: string[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  isPersonalizable?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  collections?: string[];
  search?: string;
}

export class ProductRepository {
  async findById(id: string): Promise<IProduct | null> {
    return ProductModel.findById(id).populate('categoryIds', 'name slug').exec();
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    return ProductModel.findOne({ slug }).populate('categoryIds', 'name slug').exec();
  }

  async findBySku(sku: string): Promise<IProduct | null> {
    return ProductModel.findOne({ sku }).exec();
  }

  async create(data: Partial<IProduct>): Promise<IProduct> {
    const product = new ProductModel(data);
    return product.save();
  }

  async update(id: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = await ProductModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).populate('categoryIds', 'name slug');
    if (!product) throw AppError.notFound('Product not found');
    return product;
  }

  async delete(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id);
  }

  async findAll(filter: ProductFilter = {}, pagination?: PaginationQuery): Promise<IProduct[]> {
    const query = this.buildQuery(filter);
    const mongoQuery = ProductModel.find(query).populate('categoryIds', 'name slug');
    if (pagination) {
      mongoQuery.skip(pagination.skip).limit(pagination.limit).sort(pagination.sort);
    }
    return mongoQuery.exec();
  }

  async count(filter: ProductFilter = {}): Promise<number> {
    return ProductModel.countDocuments(this.buildQuery(filter));
  }

  async findFeatured(limit = 12): Promise<IProduct[]> {
    return ProductModel.find({ status: 'active', isFeatured: true })
      .sort({ salesCount: -1 })
      .limit(limit)
      .exec();
  }

  async findNewArrivals(limit = 12): Promise<IProduct[]> {
    return ProductModel.find({ status: 'active', isNewArrival: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findBestSellers(limit = 12): Promise<IProduct[]> {
    return ProductModel.find({ status: 'active', isBestSeller: true })
      .sort({ salesCount: -1 })
      .limit(limit)
      .exec();
  }

  async findByCategory(categoryId: string, pagination?: PaginationQuery): Promise<IProduct[]> {
    const query = ProductModel.find({ categoryIds: categoryId, status: 'active' });
    if (pagination) {
      query.skip(pagination.skip).limit(pagination.limit).sort(pagination.sort);
    }
    return query.exec();
  }

  async findRelated(productId: string, categoryIds: string[], limit = 8): Promise<IProduct[]> {
    return ProductModel.find({
      _id: { $ne: productId },
      categoryIds: { $in: categoryIds },
      status: 'active',
    })
      .sort({ salesCount: -1 })
      .limit(limit)
      .exec();
  }

  async findByIds(ids: string[]): Promise<IProduct[]> {
    return ProductModel.find({ _id: { $in: ids } }).exec();
  }

  async incrementView(id: string): Promise<void> {
    await ProductModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  }

  async updateRating(id: string, rating: number, reviewCount: number): Promise<void> {
    await ProductModel.findByIdAndUpdate(id, { $set: { rating, reviewCount } });
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    const result = await ProductModel.findOneAndUpdate(
      { _id: id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity, salesCount: quantity } },
    );
    if (!result) throw AppError.conflict('Insufficient stock');
  }

  async incrementStock(id: string, quantity: number): Promise<void> {
    await ProductModel.findByIdAndUpdate(id, { $inc: { stock: quantity } });
  }

  async searchText(searchTerm: string, limit = 20): Promise<IProduct[]> {
    return ProductModel.find(
      { $text: { $search: searchTerm }, status: 'active' },
      { score: { $meta: 'textScore' } },
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .exec();
  }

  private buildQuery(filter: ProductFilter): Record<string, any> {
    const query: Record<string, any> = {};
    if (filter.status && filter.status !== 'all') query.status = filter.status;
    else if (!filter.status) query.status = 'active';

    if (filter.categoryIds?.length) query.categoryIds = { $in: filter.categoryIds };
    if (filter.tags?.length) query.tags = { $in: filter.tags };
    if (filter.isPersonalizable !== undefined) query.isPersonalizable = filter.isPersonalizable;
    if (filter.isFeatured !== undefined) query.isFeatured = filter.isFeatured;
    if (filter.isNewArrival !== undefined) query.isNewArrival = filter.isNewArrival;
    if (filter.isBestSeller !== undefined) query.isBestSeller = filter.isBestSeller;
    if (filter.collections?.length) query.collections = { $in: filter.collections };

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
    }

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    return query;
  }
}
