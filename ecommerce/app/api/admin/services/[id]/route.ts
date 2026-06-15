import { NextRequest, NextResponse } from 'next/server'
import { deleteService } from '@/lib/services'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const deleted = deleteService(params.id)
  if (!deleted) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
