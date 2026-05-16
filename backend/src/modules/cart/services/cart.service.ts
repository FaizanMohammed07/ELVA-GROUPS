import { RedisCache } from '../../../config/redis';
import { ProductRepository } from '../../products/repositories/product.repository';
import { AppError } from '../../../utils/appError';

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  personalization?: Record<string, string>;
  addedAt: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

const cartCache = new RedisCache('cart', 7 * 24 * 3600);
const productRepo = new ProductRepository();

export class CartService {
  async getCart(userId: string): Promise<Cart> {
    const cart = await cartCache.get<Cart>(userId);
    return cart ?? { userId, items: [], updatedAt: new Date().toISOString() };
  }

  async addItem(userId: string, item: Omit<CartItem, 'addedAt'>): Promise<Cart> {
    const product = await productRepo.findById(item.productId);
    if (!product) throw AppError.notFound('Product not found');
    if (product.status !== 'active') throw AppError.badRequest('Product is not available');

    const cart = await this.getCart(userId);
    const existingIdx = cart.items.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += item.quantity;
    } else {
      cart.items.push({ ...item, addedAt: new Date().toISOString() });
    }

    cart.updatedAt = new Date().toISOString();
    await cartCache.set(userId, cart);
    return cart;
  }

  async updateItem(userId: string, productId: string, quantity: number, variantId?: string): Promise<Cart> {
    if (quantity <= 0) return this.removeItem(userId, productId, variantId);
    const cart = await this.getCart(userId);
    const idx = cart.items.findIndex(
      (i) => i.productId === productId && i.variantId === variantId,
    );
    if (idx < 0) throw AppError.notFound('Item not in cart');
    cart.items[idx].quantity = quantity;
    cart.updatedAt = new Date().toISOString();
    await cartCache.set(userId, cart);
    return cart;
  }

  async removeItem(userId: string, productId: string, variantId?: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter(
      (i) => !(i.productId === productId && i.variantId === variantId),
    );
    cart.updatedAt = new Date().toISOString();
    await cartCache.set(userId, cart);
    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    await cartCache.del(userId);
  }

  async getCartWithDetails(userId: string): Promise<any> {
    const cart = await this.getCart(userId);
    const enriched = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await productRepo.findById(item.productId);
      if (!product) continue;

      const variant = item.variantId
        ? product.variants.find((v) => v._id?.toString() === item.variantId)
        : null;
      const price = variant?.price ?? product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      enriched.push({
        ...item,
        product: {
          id: product.id,
          title: product.title,
          slug: product.slug,
          thumbnail: product.thumbnail || product.images[0],
          status: product.status,
          stock: variant?.stock ?? product.stock,
        },
        variant: variant ?? null,
        price,
        total: itemTotal,
      });
    }

    const shippingCost = subtotal >= 999 ? 0 : 79;
    return {
      items: enriched,
      subtotal,
      shippingCost,
      estimatedTotal: subtotal + shippingCost,
      itemCount: enriched.reduce((acc, i) => acc + i.quantity, 0),
    };
  }
}
