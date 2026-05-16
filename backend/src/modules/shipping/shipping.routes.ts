import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { sendSuccess } from '../../utils/apiResponse';

export const shippingRouter = Router();

shippingRouter.post('/estimate', async (req, res) => {
  const { orderValue } = req.body;
  const shippingCost = orderValue >= 999 ? 0 : 79;
  const estimatedDays = orderValue >= 5000 ? '2-3' : '5-7';
  sendSuccess(res, { shippingCost, estimatedDays, isFree: orderValue >= 999 }, 'Shipping estimate');
});

shippingRouter.post('/check-serviceability', async (req, res) => {
  const { pincode } = req.body;
  sendSuccess(res, { serviceable: true, pincode, estimatedDays: '5-7' }, 'Serviceability check');
});

shippingRouter.use(authenticate);
shippingRouter.get('/track/:trackingNumber', async (req, res) => {
  sendSuccess(res, { trackingNumber: req.params.trackingNumber, status: 'In Transit' }, 'Tracking info');
});
