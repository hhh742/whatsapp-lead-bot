'use client'

import { useEffect, useState } from 'react'
import type { Lead } from '@/lib/storage'

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  nouveau: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700' },
  contacte: { label: 'Contacté', color: 'bg-yellow-100 text-yellow-700' },
  rdv_planifie: { label: 'RDV planifié', color: 'bg-purple-100 text-purple-700' },
  qualifie: { label: 'Qualifié', color: 'bg-green-100 text-green-700' },
  perdu: { label: 'Perdu', color: 'bg-gray-100 text-gray-500' },
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <div className={`${color} text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0`}>
      {score}
    </div>
  )
}

function CanalIcon({ canal }: { canal: string }) {
  if (canal === 'whatsapp') {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Email
    </span>
  )
}

function LeadCard({ lead, onStatutChange }: { lead: Lead; onStatutChange: (id: string, statut: string) => void }) {
  const [open, setOpen] = useState(false)
  const q = lead.qualification
  const statut = STATUT_LABELS[lead.statut]

  return (
    <div className={`bg-white rounded-xl border ${lead.qualification.urgence ? 'border-orange-300' : 'border-gray-200'} shadow-sm overflow-hidden`}>
      {lead.qualification.urgence && (
        <div className="bg-orange-500 text-white text-xs font-semibold px-4 py-1">
          URGENT — Besoin &lt; 1 mois
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <ScoreBadge score={q.score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 truncate">{lead.nom}</span>
              <CanalIcon canal={lead.canal} />
              <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${statut.color}`}>
                {statut.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{lead.expediteur}</p>
            <p className="text-sm text-gray-700 mt-1 line-clamp-2">{q.resume}</p>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {[
            { icon: '🏠', label: q.type_bien },
            { icon: '💶', label: q.budget },
            { icon: '📍', label: q.localisation },
            { icon: '⏱', label: q.delai },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1.5">
              <span>{item.icon}</span>
              <span className="text-gray-600 truncate">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <select
            value={lead.statut}
            onChange={e => onStatutChange(lead.id, e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer"
          >
            {Object.entries(STATUT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button
            onClick={() => setOpen(!open)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            {open ? 'Masquer' : 'Voir message + réponse IA'}
          </button>
        </div>

        {open && (
          <div className="mt-3 space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Message original</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.message_original}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 mb-1">Réponse envoyée automatiquement</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.reponse_suggeree}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('tous')

  const loadLeads = async () => {
    const res = await fetch('/api/leads')
    const data = await res.json()
    setLeads(data)
    setLoading(false)
  }

  useEffect(() => {
    loadLeads()
    const interval = setInterval(loadLeads, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleStatutChange = async (id: string, statut: string) => {
    await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, statut }),
    })
    loadLeads()
  }

  const leadsFiltres = filtre === 'tous' ? leads : leads.filter(l => l.statut === filtre)
  const stats = {
    total: leads.length,
    nouveaux: leads.filter(l => l.statut === 'nouveau').length,
    chauds: leads.filter(l => l.qualification.score >= 7).length,
    urgents: leads.filter(l => l.qualification.urgence).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lead Agent Immo</h1>
            <p className="text-sm text-gray-500">Qualification automatique des prospects</p>
          </div>
          <button
            onClick={loadLeads}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Rafraîchir
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total leads', value: stats.total, color: 'text-gray-900' },
            { label: 'Nouveaux', value: stats.nouveaux, color: 'text-blue-600' },
            { label: 'Leads chauds (7+)', value: stats.chauds, color: 'text-green-600' },
            { label: 'Urgents', value: stats.urgents, color: 'text-orange-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {[
            { key: 'tous', label: 'Tous' },
            { key: 'nouveau', label: 'Nouveaux' },
            { key: 'contacte', label: 'Contactés' },
            { key: 'rdv_planifie', label: 'RDV' },
            { key: 'qualifie', label: 'Qualifiés' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                filtre === f.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement...</div>
        ) : leadsFiltres.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>Aucun lead pour l&apos;instant</p>
            <p className="text-sm mt-1">Les leads WhatsApp et email apparaîtront ici automatiquement</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leadsFiltres.map(lead => (
              <LeadCard key={lead.id} lead={lead} onStatutChange={handleStatutChange} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
