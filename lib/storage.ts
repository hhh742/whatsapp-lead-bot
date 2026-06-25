import fs from 'fs'
import path from 'path'
import { LeadQualification } from './claude'

export interface Lead {
  id: string
  canal: 'whatsapp' | 'email'
  expediteur: string // phone ou email
  nom: string
  message_original: string
  qualification: LeadQualification
  statut: 'nouveau' | 'contacte' | 'rdv_planifie' | 'qualifie' | 'perdu'
  created_at: string
  updated_at: string
}

const DATA_FILE = path.join(process.cwd(), 'data', 'leads.json')

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
}

export function getLeads(): Lead[] {
  ensureDataDir()
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Lead[]
  } catch {
    return []
  }
}

export function saveLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Lead {
  ensureDataDir()
  const leads = getLeads()
  const newLead: Lead = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  leads.unshift(newLead)
  fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), 'utf-8')
  return newLead
}

export function updateLeadStatut(id: string, statut: Lead['statut']): Lead | null {
  ensureDataDir()
  const leads = getLeads()
  const idx = leads.findIndex(l => l.id === id)
  if (idx === -1) return null
  leads[idx].statut = statut
  leads[idx].updated_at = new Date().toISOString()
  fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), 'utf-8')
  return leads[idx]
}
