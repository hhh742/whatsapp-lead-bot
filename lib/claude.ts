import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface LeadQualification {
  projet: 'achat' | 'location' | 'estimation' | 'autre'
  budget: string
  type_bien: string
  localisation: string
  delai: string
  financement: string
  score: number // 1-10
  resume: string
  reponse_suggeree: string
  urgence: boolean
}

export async function qualifierLead(
  message: string,
  canal: 'whatsapp' | 'email',
  agencyContext: string
): Promise<LeadQualification> {
  const prompt = `Tu es un assistant de qualification de leads immobiliers pour ${agencyContext}.

Analyse ce message entrant et extrais les informations de qualification.

MESSAGE DU PROSPECT :
<message>
${message}
</message>

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "projet": "achat" | "location" | "estimation" | "autre",
  "budget": "montant extrait ou 'Non précisé'",
  "type_bien": "appartement / maison / commerce / terrain / 'Non précisé'",
  "localisation": "ville/quartier ou 'Non précisé'",
  "delai": "délai exprimé ou 'Non précisé'",
  "financement": "cash / prêt en cours / prêt à faire / 'Non précisé'",
  "score": [1-10 selon qualité du lead : 10=budget+délai+projet clairs, 1=vague sans info],
  "resume": "1 phrase résumant le besoin",
  "reponse_suggeree": "Message de réponse professionnel et chaleureux via ${canal}, 3-4 phrases max, qui remercie, confirme réception, pose 1-2 questions pour qualifier davantage si besoin",
  "urgence": true si besoin dans moins d'1 mois
}

RÈGLES :
- Ne jamais inventer d'infos non présentes dans le message
- Score > 7 = lead chaud (budget + délai + projet définis)
- Score 4-6 = lead tiède (quelques infos manquantes)
- Score < 4 = lead froid (trop vague)
- La réponse suggérée doit être naturelle, pas robotique`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    // Extraire le JSON en trouvant les accolades équilibrées
    const start = text.indexOf('{')
    if (start === -1) throw new Error('No JSON found')
    let depth = 0
    let end = -1
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++
      else if (text[i] === '}') {
        depth--
        if (depth === 0) { end = i; break }
      }
    }
    if (end === -1) throw new Error('Unbalanced JSON')
    return JSON.parse(text.slice(start, end + 1)) as LeadQualification
  } catch {
    return {
      projet: 'autre',
      budget: 'Non précisé',
      type_bien: 'Non précisé',
      localisation: 'Non précisé',
      delai: 'Non précisé',
      financement: 'Non précisé',
      score: 3,
      resume: 'Message reçu — qualification manuelle nécessaire',
      reponse_suggeree: `Bonjour, merci pour votre message. Nous l'avons bien reçu et reviendrons vers vous très rapidement. Cordialement, ${process.env.AGENCY_NAME}`,
      urgence: false,
    }
  }
}
