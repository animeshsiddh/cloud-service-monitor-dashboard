/** @typedef {'HEALTHY'|'DEGRADED'|'DOWN'} ServiceStatus */
/** @typedef {'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'} IncidentSeverity */
/** @typedef {'OPEN'|'ACKNOWLEDGED'|'RESOLVED'} IncidentStatus */

const now = Date.now()
/** @param {number} minsAgo */
const iso = (minsAgo) => new Date(now - minsAgo * 60000).toISOString()

/** @type {{ id: string, name: string, status: ServiceStatus, uptimePct: number, lastCheckedAt: string, openIncidentCount: number }[]} */
let services = [
  {
    id: 'svc-email',
    name: 'Email',
    status: 'HEALTHY',
    uptimePct: 99.9,
    lastCheckedAt: iso(2),
    openIncidentCount: 1,
  },
  {
    id: 'svc-drive',
    name: 'Drive',
    status: 'HEALTHY',
    uptimePct: 99.7,
    lastCheckedAt: iso(1),
    openIncidentCount: 0,
  },
  {
    id: 'svc-crm',
    name: 'CRM',
    status: 'DEGRADED',
    uptimePct: 94.2,
    lastCheckedAt: iso(5),
    openIncidentCount: 3,
  },
  {
    id: 'svc-chat',
    name: 'Chat',
    status: 'DOWN',
    uptimePct: 0,
    lastCheckedAt: iso(15),
    openIncidentCount: 5,
  },
]

const titles = [
  'Database Outage',
  'API Latency Spike',
  'Auth Token Errors',
  'Storage Quota Mismatch',
  'Webhook Delivery Failures',
  'Search Index Lag',
  'CDN Cache Purge',
  'Mobile Push Delay',
  'Billing Sync Stuck',
  'Report Export Timeout',
  'Calendar Sync Drift',
  'Video Transcode Queue',
]

const svcIds = ['svc-email', 'svc-drive', 'svc-crm', 'svc-chat']
const severities = /** @type {IncidentSeverity[]} */ ([
  'HIGH',
  'MEDIUM',
  'LOW',
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'MEDIUM',
  'HIGH',
  'LOW',
  'MEDIUM',
  'HIGH',
])
const statuses = /** @type {IncidentStatus[]} */ ([
  'OPEN',
  'ACKNOWLEDGED',
  'RESOLVED',
  'OPEN',
  'OPEN',
  'RESOLVED',
  'ACKNOWLEDGED',
  'OPEN',
  'RESOLVED',
  'OPEN',
  'ACKNOWLEDGED',
  'OPEN',
])

/** @type {{ id: string, title: string, serviceId: string, serviceName: string, severity: IncidentSeverity, status: IncidentStatus, assignee: string, createdAt: string, updatedAt: string, description: string, notes: string }[]} */
let incidents = titles.map((title, i) => {
  const serviceId = svcIds[i % svcIds.length]
  const serviceName =
    services.find((s) => s.id === serviceId)?.name ?? 'Unknown'
  return {
    id: `INC-${100 + i}`,
    title,
    serviceId,
    serviceName,
    severity: severities[i],
    status: statuses[i],
    assignee: i % 3 === 0 ? 'John Doe' : i % 3 === 1 ? 'Jane Smith' : '—',
    createdAt: iso(30 + i * 7),
    updatedAt: iso(i * 3),
    description: `Impact assessment and timeline for: ${title}. Operations are engaged and monitoring.`,
    notes: i % 2 === 0 ? 'Initial triage complete.' : '',
  }
})

function recomputeOpenCounts() {
  const counts = Object.fromEntries(services.map((s) => [s.id, 0]))
  for (const inc of incidents) {
    if (inc.status === 'OPEN' || inc.status === 'ACKNOWLEDGED') {
      counts[inc.serviceId] = (counts[inc.serviceId] ?? 0) + 1
    }
  }
  services = services.map((s) => ({
    ...s,
    openIncidentCount: counts[s.id] ?? 0,
  }))
}

recomputeOpenCounts()

/**
 * @param {{ severities?: string[], statuses?: string[], serviceId?: string|null }} filter
 */
export function filterIncidents(filter) {
  let list = [...incidents]
  if (filter.severities?.length) {
    list = list.filter((i) => filter.severities.includes(i.severity))
  }
  if (filter.statuses?.length) {
    list = list.filter((i) => filter.statuses.includes(i.status))
  }
  if (filter.serviceId) {
    list = list.filter((i) => i.serviceId === filter.serviceId)
  }
  return list
}

export function getServices() {
  return services.map((s) => ({
    ...s,
    lastCheckedAt: new Date().toISOString(),
  }))
}

/**
 * @param {{ severities?: string[], statuses?: string[], serviceId?: string|null }} filter
 * @param {number} page
 * @param {number} pageSize
 */
export function getIncidentsPage(filter, page, pageSize) {
  const filtered = filterIncidents(filter)
  const totalCount = filtered.length
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)
  return { items, totalCount }
}

/** @param {string} id */
export function getIncidentById(id) {
  return incidents.find((i) => i.id === id) ?? null
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} patch
 */
export function patchIncident(id, patch) {
  const idx = incidents.findIndex((i) => i.id === id)
  if (idx === -1) throw new Error(`Incident ${id} not found`)
  const updated = {
    ...incidents[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  incidents[idx] = updated
  recomputeOpenCounts()
  return updated
}

/**
 * @param {{ title: string, serviceId: string, severity: IncidentSeverity, description: string }} input
 */
export function createIncidentRecord(input) {
  const svc = services.find((s) => s.id === input.serviceId)
  const n = incidents.length + 100
  const id = `INC-${n}`
  const row = {
    id,
    title: input.title,
    serviceId: input.serviceId,
    serviceName: svc?.name ?? 'Unknown',
    severity: input.severity,
    status: /** @type {IncidentStatus} */ ('OPEN'),
    assignee: '—',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: input.description,
    notes: '',
  }
  incidents = [row, ...incidents]
  recomputeOpenCounts()
  return row
}

/** Simulate network latency for mutations (notes UX). */
export function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}
