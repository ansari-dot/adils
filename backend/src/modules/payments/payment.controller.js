import { PaymentService } from './payment.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake_key_for_sandbox', {
  apiVersion: '2023-10-16',
});

/** Builds the final amount / metadata for a payment, trusting the DB for courses. */
const resolvePayment = async (req) => {
  const { amount, metadata = {} } = req.body;

  if (metadata.type === 'enrollment') {
    return await PaymentService.resolveEnrollmentPayment(req.user._id, metadata);
  }

  if (!amount) {
    throw new ApiError(400, 'Amount is required');
  }
  return {
    amount,
    productName: 'Bakery Order',
    metadata: { ...metadata, userId: req.user._id.toString() },
  };
};

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, metadata } = await resolvePayment(req);
  const paymentIntent = await PaymentService.createPaymentIntent(amount, metadata);
  res.status(200).json(new ApiResponse(200, { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }, 'Payment Intent created successfully'));
});

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { successUrl, cancelUrl } = req.body;
  const { amount, metadata, productName } = await resolvePayment(req);

  const session = await PaymentService.createCheckoutSession(amount, metadata, successUrl, cancelUrl, productName);
  res.status(200).json(new ApiResponse(200, { url: session.url, sessionId: session.id }, 'Checkout Session created successfully'));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { sessionId, paymentIntentId } = req.body;
  if (!sessionId && !paymentIntentId) {
    throw new ApiError(400, 'sessionId or paymentIntentId is required');
  }

  const result = sessionId
    ? await PaymentService.verifyCheckoutSession(sessionId, req.user._id)
    : await PaymentService.verifyPaymentIntent(paymentIntentId, req.user._id);

  res.status(200).json(new ApiResponse(200, result, result.paid ? 'Payment verified' : 'Payment not completed'));
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = JSON.parse(req.body);
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await PaymentService.handleWebhook(event);
  res.json({ received: true });
});
