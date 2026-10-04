import express from 'express';
import { createPaymentIntent, createCheckoutSession, verifyPayment } from './payment.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify', protect, verifyPayment);

export default router;
