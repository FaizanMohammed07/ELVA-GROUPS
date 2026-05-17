import { Request, Response } from 'express';
import { CartService } from './services/cart.service';
import { sendSuccess } from '../../utils/apiResponse';

const cartService = new CartService();

export const CartController = {
  async getCart(req: Request, res: Response): Promise<void> {
    const cart = await cartService.getCartWithDetails(req.user!.id);
    sendSuccess(res, cart, 'Cart fetched');
  },

  async addItem(req: Request, res: Response): Promise<void> {
    const { productId, variantId, quantity, personalization } = req.body;
    const cart = await cartService.addItem(req.user!.id, { productId, variantId, quantity: quantity || 1, personalization });
    sendSuccess(res, cart, 'Item added to cart');
  },

  async updateItem(req: Request, res: Response): Promise<void> {
    const { quantity, variantId } = req.body;
    const cart = await cartService.updateItem(req.user!.id, req.params["productId"] as string, quantity, variantId);
    sendSuccess(res, cart, 'Cart updated');
  },

  async removeItem(req: Request, res: Response): Promise<void> {
    const { variantId } = req.query;
    const cart = await cartService.removeItem(req.user!.id, req.params["productId"] as string, variantId as string);
    sendSuccess(res, cart, 'Item removed');
  },

  async clearCart(req: Request, res: Response): Promise<void> {
    await cartService.clearCart(req.user!.id);
    sendSuccess(res, null, 'Cart cleared');
  },
};
