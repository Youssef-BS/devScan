import { Router, raw, json } from 'express';
import {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
  testWebhook,
  webhookTestHealth,
  verifyPayment,
} from '../controllers/Subscription.controller.js';
import { auth } from '../middleware/auth.js';

const router : Router = Router();

// Test endpoints for debugging
router.get('/webhook/health', webhookTestHealth);
router.post('/webhook/test', raw({type: 'application/json'}), testWebhook);

// Webhook endpoint needs raw body for signature verification
router.post('/webhook', raw({type: 'application/json'}), handleWebhook);

// All other routes need JSON parsing
router.use(json());

router.post('/checkout', auth, createCheckoutSession);
router.post('/verify-payment', auth, verifyPayment);
router.get('/status', auth, getSubscriptionStatus);
router.post('/cancel', auth, cancelSubscription);

export default router;
