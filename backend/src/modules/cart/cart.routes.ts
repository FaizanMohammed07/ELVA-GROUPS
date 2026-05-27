import { Router } from 'express';
import { CartController } from './cart.controller';
import { authenticate } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validate';
import { validateMongoId } from '../../middleware/mongoId';
import { addCartItemSchema, updateCartItemSchema } from './cart.validators';

export const cartRouter = Router();

cartRouter.use(authenticate);
cartRouter.get('/', CartController.getCart);
cartRouter.post('/items', validateBody(addCartItemSchema), CartController.addItem);
cartRouter.put('/items/:productId', validateMongoId('productId'), validateBody(updateCartItemSchema), CartController.updateItem);
cartRouter.delete('/items/:productId', validateMongoId('productId'), CartController.removeItem);
cartRouter.delete('/', CartController.clearCart);
