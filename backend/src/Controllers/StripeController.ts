import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler.js';
import prisma from '../utils/client.js';
import {
  stripe,
  createStripeCustomer,
  createCheckoutSession,
  constructWebhookEvent,
} from '../Services/StripeService.js';
import Stripe from 'stripe';

// ─── POST /api/stripe/create-checkout ────────────────────────────────────────
// Admin triggers this after register to get the Stripe payment URL
export const createCheckout = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    return res.status(404).json({ message: 'Tenant not found' });
  }

  if (tenant.subscriptionStatus === 'ACTIVE') {
    return res.status(400).json({ message: 'Subscription already active' });
  }

  // Create or reuse Stripe customer
  let customerId = tenant.stripeCustomerId;
  if (!customerId) {
    const customer = await createStripeCustomer(tenant.name, tenant.email);
    customerId = customer.id;
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await createCheckoutSession(customerId, tenantId, tenant.name);
  res.json({ url: session.url });
});

// ─── POST /api/stripe/webhook ─────────────────────────────────────────────────
// Stripe sends events here (must use rawBody — configured in index.ts)
export const stripeWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(req.body as Buffer, sig);
  } catch (err: any) {
    console.error('❌ Webhook signature error:', err.message);
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  // ── Subscription activated ────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const tenantId = session.metadata?.tenantId;
    if (tenantId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStatus: 'ACTIVE',
          stripeSubscriptionId: session.subscription as string,
        },
      });
      console.log(`✅ Tenant ${tenantId} subscription activated`);
    }
  }

  // ── Subscription cancelled / expired ─────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    await prisma.tenant.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { subscriptionStatus: 'CANCELLED' },
    });
    console.log(`⚠️ Subscription ${subscription.id} cancelled`);
  }

  res.json({ received: true });
});

// ─── POST /api/stripe/verify-session ─────────────────────────────────────────
// Called by SignUpSuccess page using ?session_id from Stripe redirect URL.
// This is the reliable way to activate subscriptions in development (no webhook needed).
export const verifySession = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required' });
  }

  // Retrieve session directly from Stripe API
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid' || session.status !== 'complete') {
    return res.status(402).json({ message: 'Payment not completed yet' });
  }

  const tenantId = session.metadata?.tenantId;
  if (!tenantId) {
    return res.status(400).json({ message: 'Invalid session: no tenant ID found' });
  }

  // Activate tenant subscription
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      subscriptionStatus: 'ACTIVE',
      stripeSubscriptionId: session.subscription as string,
    },
  });

  console.log(`✅ Tenant ${tenantId} activated via session verify`);
  res.json({ success: true, message: 'Subscription activated successfully' });
});
