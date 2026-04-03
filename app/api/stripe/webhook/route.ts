import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateUserPlan } from '@/lib/auth/kv';
import { getStripe } from '@/lib/auth/stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.metadata?.email ?? session.customer_email;
      if (email) {
        await updateUserPlan(email, 'pro', session.customer as string);
        console.log('UPGRADE_TO_PRO:', email);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      // Look up email from customer
      const customer = await getStripe().customers.retrieve(sub.customer as string);
      if (!customer.deleted && customer.email) {
        await updateUserPlan(customer.email, 'free');
        console.log('DOWNGRADE_TO_FREE:', customer.email);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
