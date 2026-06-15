import { NextResponse } from 'next/server'
import { getAllServices, addService } from '@/lib/services'

export function GET() {
  return NextResponse.json(getAllServices())
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, description, price, category, deliveryTime, image } = body
  if (!name || !description || !price || !category || !deliveryTime) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const service = addService({
    name,
    description,
    price: Math.round(Number(price) * 100),
    category,
    deliveryTime,
    image: image || `https://picsum.photos/seed/${Date.now()}/600/400`,
  })
  return NextResponse.json(service, { status: 201 })
}
