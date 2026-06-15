import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { CartItem } from '@/components/CartContext'

export async function POST(req: Request) {
  const { items, customerName, customerEmail } = await req.json() as {
    items: CartItem[]
    customerName: string
    customerEmail: string
  }

  if (!items?.length) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail,
    metadata: { customerName, customerEmail },
    line_items: items.map((item) => ({
      price_data: {
        currency: 'usd',
        unit_amount: item.price,
        product_data: {
          name: item.name,
          images: [item.image],
        },
      },
      quantity: item.quantity,
    })),
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout`,
  })

  return NextResponse.json({ url: session.url })
}
