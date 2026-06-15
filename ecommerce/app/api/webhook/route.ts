import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { addOrder } from '@/lib/orders'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    addOrder({
      customerName: session.metadata?.customerName || 'Unknown',
      customerEmail: session.customer_email || session.metadata?.customerEmail || '',
      items: lineItems.data.map((item) => ({
        serviceId: '',
        serviceName: item.description || '',
        price: item.amount_total || 0,
        quantity: item.quantity || 1,
      })),
      total: session.amount_total || 0,
      status: 'paid',
    })
  }

  return NextResponse.json({ received: true })
}
