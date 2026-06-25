const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`

export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export function extractWhatsAppMessage(body: Record<string, unknown>): {
  phone: string
  message: string
  name: string
} | null {
  try {
    const entry = (body.entry as Record<string, unknown>[])?.[0]
    const changes = (entry?.changes as Record<string, unknown>[])?.[0]
    const value = changes?.value as Record<string, unknown>
    const messages = value?.messages as Record<string, unknown>[]
    const contacts = value?.contacts as Record<string, unknown>[]

    if (!messages?.[0]) return null

    const msg = messages[0]
    const contact = contacts?.[0]

    const phone = msg.from as string
    const name = (contact?.profile as Record<string, unknown>)?.name as string || phone
    const text = (msg.text as Record<string, unknown>)?.body as string || ''

    return { phone, message: text, name }
  } catch {
    return null
  }
}
