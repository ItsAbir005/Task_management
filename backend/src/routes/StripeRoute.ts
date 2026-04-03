import express from 'express';
import { createCheckout, stripeWebhookHandler, verifySession } from '../Controllers/StripeController.js';
import { AuthenticateMiddleware, authorize } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

// Webhook — raw body (mounted separately in index.ts with express.raw)
router.post('/webhook', stripeWebhookHandler);

// Verify session after Stripe redirect (public — no auth needed, Stripe session_id is the proof)
router.post('/verify-session', verifySession);

// Admin triggers checkout session creation
router.post('/create-checkout', AuthenticateMiddleware, authorize('ADMIN'), createCheckout);

export default router;
