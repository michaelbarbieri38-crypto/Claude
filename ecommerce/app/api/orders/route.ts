import { NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/orders'

export function GET() {
  return NextResponse.json(getAllOrders())
}
