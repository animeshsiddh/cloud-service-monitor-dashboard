/** GraphQL schema — executed locally via SchemaLink (mock store). */
export const typeDefs = /* GraphQL */ `
  enum ServiceStatus {
    HEALTHY
    DEGRADED
    DOWN
  }

  enum IncidentSeverity {
    CRITICAL
    HIGH
    MEDIUM
    LOW
  }

  enum IncidentStatus {
    OPEN
    ACKNOWLEDGED
    RESOLVED
  }

  type Service {
    id: ID!
    name: String!
    status: ServiceStatus!
    uptimePct: Float!
    lastCheckedAt: String!
    openIncidentCount: Int!
  }

  type Incident {
    id: ID!
    title: String!
    serviceId: ID!
    serviceName: String!
    severity: IncidentSeverity!
    status: IncidentStatus!
    assignee: String!
    createdAt: String!
    updatedAt: String!
    description: String!
    notes: String!
  }

  input IncidentFiltersInput {
    severities: [IncidentSeverity!]
    statuses: [IncidentStatus!]
    serviceId: ID
  }

  type IncidentsPage {
    items: [Incident!]!
    totalCount: Int!
  }

  input CreateIncidentInput {
    title: String!
    serviceId: ID!
    severity: IncidentSeverity!
    description: String!
  }

  type Query {
    services: [Service!]!
    incidents(
      filter: IncidentFiltersInput
      page: Int!
      pageSize: Int!
    ): IncidentsPage!
    incident(id: ID!): Incident
  }

  type Mutation {
    updateIncidentNotes(id: ID!, notes: String!): Incident!
    acknowledgeIncident(id: ID!): Incident!
    resolveIncident(id: ID!): Incident!
    createIncident(input: CreateIncidentInput!): Incident!
  }
`
