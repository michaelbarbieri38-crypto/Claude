import { NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/orders'

export async function GET() {
  return NextResponse.json(getAllOrders())
}
