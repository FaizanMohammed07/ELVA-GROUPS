import { EmailService } from './email.service';
import { logger } from '../../../utils/logger';

const emailService = new EmailService();

export class NotificationService {
  async sendOrderConfirmation(userId: string, orderNumber: string, total: number): Promise<void> {
    logger.info('Order confirmation notification', { userId, orderNumber, total });
    // Firebase push + WhatsApp + Email can be triggered here
  }

  async sendDeliveryConfirmation(userId: string, orderNumber: string): Promise<void> {
    logger.info('Delivery confirmation notification', { userId, orderNumber });
  }

  async sendShippingUpdate(userId: string, orderNumber: string, carrier: string, trackingNumber: string): Promise<void> {
    logger.info('Shipping update notification', { userId, orderNumber, carrier, trackingNumber });
  }

  async sendLowStockAlert(productTitle: string, sku: string, stock: number): Promise<void> {
    logger.warn('Low stock alert', { productTitle, sku, stock });
  }
}
