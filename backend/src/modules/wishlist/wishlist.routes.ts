import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { authenticate } from '../../middleware/authenticate';

export const wishlistRouter = Router();

wishlistRouter.use(authenticate);
wishlistRouter.get('/', WishlistController.getWishlist);
wishlistRouter.post('/:productId', WishlistController.addToWishlist);
wishlistRouter.delete('/:productId', WishlistController.removeFromWishlist);
wishlistRouter.get('/check/:productId', WishlistController.checkWishlist);
