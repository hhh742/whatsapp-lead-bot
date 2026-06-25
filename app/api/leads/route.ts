import { NextRequest, NextResponse } from 'next/server'
import { getLeads, updateLeadStatut } from '@/lib/storage'

export async function GET() {
  const leads = getLeads()
  return NextResponse.json(leads)
}

export async function PATCH(req: NextRequest) {
  const { id, statut } = await req.json()
  const updated = updateLeadStatut(id, statut)
  if (!updated) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  return NextResponse.json(updated)
}
