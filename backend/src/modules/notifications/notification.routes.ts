import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { sendSuccess } from '../../utils/apiResponse';

export const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get('/', async (_req, res) => sendSuccess(res, [], 'Notifications'));
notificationRouter.patch('/:id/read', async (_req, res) => sendSuccess(res, null, 'Marked as read'));
notificationRouter.post('/fcm-token', async (_req, res) => sendSuccess(res, null, 'FCM token saved'));
