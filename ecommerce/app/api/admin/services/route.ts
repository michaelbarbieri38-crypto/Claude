import { NextRequest, NextResponse } from 'next/server'
import { getAllServices, addService } from '@/lib/services'

export async function GET() {
  return NextResponse.json(getAllServices())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, category, deliveryTime, image } = body

  if (!name || !description || !price || !category || !deliveryTime || !image) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const service = addService({
    name,
    description,
    price: Math.round(parseFloat(price) * 100),
    category,
    deliveryTime,
    image,
  })

  return NextResponse.json(service, { status: 201 })
}
