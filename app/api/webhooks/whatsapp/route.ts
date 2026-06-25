import { NextRequest, NextResponse } from 'next/server'
import { extractWhatsAppMessage, sendWhatsAppMessage } from '@/lib/whatsapp'
import { qualifierLead } from '@/lib/claude'
import { saveLead } from '@/lib/storage'

// Vérification du webhook Meta (obligatoire au setup)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Réception des messages WhatsApp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Extraction du message
    const extracted = extractWhatsAppMessage(body)
    if (!extracted) {
      return NextResponse.json({ status: 'ignored' })
    }

    const { phone, message, name } = extracted
    if (!message.trim()) return NextResponse.json({ status: 'empty' })

    const agencyContext = `${process.env.AGENCY_NAME} (${process.env.AGENCY_EMAIL})`

    // Qualification IA
    const qualification = await qualifierLead(message, 'whatsapp', agencyContext)

    // Sauvegarde lead
    const lead = saveLead({
      canal: 'whatsapp',
      expediteur: phone,
      nom: name,
      message_original: message,
      qualification,
      statut: 'nouveau',
    })

    // Réponse automatique WhatsApp
    await sendWhatsAppMessage(phone, qualification.reponse_suggeree)

    console.log(`[LEAD] Nouveau lead WhatsApp — ${name} (${phone}) — Score: ${qualification.score}/10`)

    return NextResponse.json({ status: 'ok', lead_id: lead.id })
  } catch (err) {
    console.error('[WEBHOOK] Erreur:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
