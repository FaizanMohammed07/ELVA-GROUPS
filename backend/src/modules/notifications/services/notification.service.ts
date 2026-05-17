import { EmailService } from './email.service';
import { logger } from '../../../utils/logger';

const emailService = new EmailService();

export class NotificationService {
  async sendOrderConfirmation(userId: string, orderNumber: string, total: number): Promise<void> {
    logger.info({ userId, orderNumber, total }, 'Order confirmation notification');
    // Firebase push + WhatsApp + Email can be triggered here
  }

  async sendDeliveryConfirmation(userId: string, orderNumber: string): Promise<void> {
    logger.info({ userId, orderNumber }, 'Delivery confirmation notification');
  }

  async sendShippingUpdate(userId: string, orderNumber: string, carrier: string, trackingNumber: string): Promise<void> {
    logger.info({ userId, orderNumber, carrier, trackingNumber }, 'Shipping update notification');
  }

  async sendLowStockAlert(productTitle: string, sku: string, stock: number): Promise<void> {
    logger.warn({ productTitle, sku, stock }, 'Low stock alert');
  }
}
