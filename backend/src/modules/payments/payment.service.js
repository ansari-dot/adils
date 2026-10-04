import Stripe from 'stripe';
import { ApiError } from '../../utils/ApiError.js';
import { Order } from '../orders/order.model.js';
import { Enrollment } from '../courses/enrollment.model.js';
import { Course } from '../courses/course.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake_key_for_sandbox', {
  apiVersion: '2023-10-16',
});

export class PaymentService {
  /**
   * For course purchases the price is ALWAYS taken from the database,
   * never from the client. Also verifies the enrollment belongs to the user.
   */
  static async resolveEnrollmentPayment(userId, metadata = {}) {
    const enrollment = await Enrollment.findById(metadata.enrollmentId);
    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found');
    }
    if (enrollment.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'This enrollment does not belong to you');
    }
    if (enrollment.paymentStatus === 'paid') {
      throw new ApiError(400, 'You already own this course');
    }
    const course = await Course.findById(enrollment.course);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }
    return {
      amount: course.price,
      productName: `Course: ${course.title}`,
      metadata: {
        type: 'enrollment',
        enrollmentId: enrollment._id.toString(),
        courseId: course._id.toString(),
        userId: userId.toString(),
      },
    };
  }

  static async createPaymentIntent(amount, metadata) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses smallest currency unit (e.g. cents)
        currency: 'usd',
        metadata: metadata, // Store orderId, type, userId etc.
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      throw new ApiError(500, `Stripe error: ${error.message}`);
    }
  }

  static async createCheckoutSession(amount, metadata, successUrl, cancelUrl, productName = 'Bakery Order') {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: productName,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        metadata: metadata,
        payment_intent_data: { metadata },
        success_url: successUrl || 'http://localhost:8081?tab=profile',
        cancel_url: cancelUrl || 'http://localhost:8081?tab=cart',
      });
      return session;
    } catch (error) {
      throw new ApiError(500, `Stripe Checkout error: ${error.message}`);
    }
  }

  /**
   * Marks the order / enrollment as paid. Idempotent – safe to call from
   * both the webhook and the client-side verification endpoint.
   */
  static async fulfillPayment(metadata, paymentId) {
    if (!metadata) return null;

    if (metadata.type === 'order' && metadata.orderId) {
      return await Order.findByIdAndUpdate(
        metadata.orderId,
        { paymentStatus: 'paid', status: 'confirmed', paymentIntentId: paymentId },
        { new: true }
      );
    }

    if (metadata.type === 'enrollment' && metadata.enrollmentId) {
      return await Enrollment.findByIdAndUpdate(
        metadata.enrollmentId,
        { paymentStatus: 'paid', paymentIntentId: paymentId },
        { new: true }
      );
    }
    return null;
  }

  /** Verify a Stripe Checkout session (web flow) and fulfill it if paid. */
  static async verifyCheckoutSession(sessionId, userId) {
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      throw new ApiError(400, `Invalid checkout session: ${error.message}`);
    }

    if (session.metadata?.userId && session.metadata.userId !== userId.toString()) {
      throw new ApiError(403, 'This payment does not belong to you');
    }

    if (session.payment_status !== 'paid') {
      return { paid: false, type: session.metadata?.type || null };
    }

    await PaymentService.fulfillPayment(session.metadata, session.payment_intent || session.id);
    return {
      paid: true,
      type: session.metadata?.type || null,
      courseId: session.metadata?.courseId || null,
      orderId: session.metadata?.orderId || null,
    };
  }

  /** Verify a PaymentIntent (native PaymentSheet flow) and fulfill it if succeeded. */
  static async verifyPaymentIntent(paymentIntentId, userId) {
    let intent;
    try {
      intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      throw new ApiError(400, `Invalid payment intent: ${error.message}`);
    }

    if (intent.metadata?.userId && intent.metadata.userId !== userId.toString()) {
      throw new ApiError(403, 'This payment does not belong to you');
    }

    if (intent.status !== 'succeeded') {
      return { paid: false, type: intent.metadata?.type || null };
    }

    await PaymentService.fulfillPayment(intent.metadata, intent.id);
    return {
      paid: true,
      type: intent.metadata?.type || null,
      courseId: intent.metadata?.courseId || null,
      orderId: intent.metadata?.orderId || null,
    };
  }

  static async handleWebhook(event) {
    if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
      const paymentData = event.data.object;
      await PaymentService.fulfillPayment(paymentData.metadata, paymentData.payment_intent || paymentData.id);
    }
    return { received: true };
  }
}
