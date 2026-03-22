import {
  createIncidentRecord,
  delay,
  getIncidentById,
  getIncidentsPage,
  getServices,
  patchIncident,
} from './mockStore'

export const mockResolvers = {
  Query: {
    services: () => getServices(),
    incidents: (_, { filter, page, pageSize }) => {
      const f = filter ?? {}
      return getIncidentsPage(
        {
          severities: f.severities ?? undefined,
          statuses: f.statuses ?? undefined,
          serviceId: f.serviceId ?? null,
        },
        page,
        pageSize,
      )
    },
    incident: (_, { id }) => getIncidentById(id),
  },
  Mutation: {
    updateIncidentNotes: async (_, { id, notes }) => {
      await delay(400)
      return patchIncident(id, { notes })
    },
    acknowledgeIncident: (_, { id }) =>
      patchIncident(id, { status: 'ACKNOWLEDGED' }),
    resolveIncident: (_, { id }) => patchIncident(id, { status: 'RESOLVED' }),
    createIncident: (_, { input }) => createIncidentRecord(input),
  },
}
