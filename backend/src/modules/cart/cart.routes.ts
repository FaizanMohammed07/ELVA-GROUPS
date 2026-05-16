import { Router } from 'express';
import { CartController } from './cart.controller';
import { authenticate } from '../../middleware/authenticate';

export const cartRouter = Router();

cartRouter.use(authenticate);
cartRouter.get('/', CartController.getCart);
cartRouter.post('/items', CartController.addItem);
cartRouter.put('/items/:productId', CartController.updateItem);
cartRouter.delete('/items/:productId', CartController.removeItem);
cartRouter.delete('/', CartController.clearCart);
