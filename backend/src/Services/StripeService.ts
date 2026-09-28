import Stripe from 'stripe';
import config from '../config/config.js';

const stripe = config.stripe.secretKey ? new Stripe(config.stripe.secretKey) : null;

export const getStripe = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in the backend environment.');
  }

  return stripe;
};

// ─── Create a Stripe customer ────────────────────────────────────────────────
export const createStripeCustomer = async (name: string, email: string) => {
  return await getStripe().customers.create({ name, email });
};

// ─── Create recurring monthly checkout session ───────────────────────────────
export const createCheckoutSession = async (
  customerId: string,
  tenantId: string,
  tenantName: string
) => {
  return await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'HRM SaaS — Monthly Subscription',
            description: `Full access for ${tenantName} — Unlimited HR, Managers & Employees`,
          },
          recurring: {
            interval: 'month',
          },
          unit_amount: 2999, // $29.99/month
        },
        quantity: 1,
      },
    ],
    metadata: {
      tenantId,
    },
    client_reference_id: tenantId,
    success_url: `${config.frontendUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontendUrl}/signup?cancelled=true`,
  });
};

// ─── Verify & parse webhook event (needs raw body) ───────────────────────────
export const constructWebhookEvent = (payload: Buffer, sig: string) => {
  return getStripe().webhooks.constructEvent(payload, sig, config.stripe.webhookSecret);
};
