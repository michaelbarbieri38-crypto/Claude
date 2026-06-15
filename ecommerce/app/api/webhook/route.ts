import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { addOrder } from '@/lib/orders'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id)
    const items = lineItemsResponse.data.map((li) => ({
      serviceId: '',
      serviceName: li.description || '',
      price: li.amount_total,
      quantity: li.quantity || 1,
    }))

    addOrder({
      customerName: session.metadata?.customerName || '',
      customerEmail: session.metadata?.customerEmail || session.customer_email || '',
      items,
      total: session.amount_total || 0,
      status: 'paid',
    })
  }

  return NextResponse.json({ received: true })
}
