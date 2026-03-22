import { gql } from '@apollo/client'

export const UPDATE_INCIDENT_NOTES = gql`
  mutation UpdateIncidentNotes($id: ID!, $notes: String!) {
    updateIncidentNotes(id: $id, notes: $notes) {
      id
      notes
      updatedAt
    }
  }
`

export const ACKNOWLEDGE_INCIDENT = gql`
  mutation AcknowledgeIncident($id: ID!) {
    acknowledgeIncident(id: $id) {
      id
      status
      updatedAt
    }
  }
`

export const RESOLVE_INCIDENT = gql`
  mutation ResolveIncident($id: ID!) {
    resolveIncident(id: $id) {
      id
      status
      updatedAt
    }
  }
`

export const CREATE_INCIDENT = gql`
  mutation CreateIncident($input: CreateIncidentInput!) {
    createIncident(input: $input) {
      id
      title
      serviceId
      serviceName
      severity
      status
      assignee
      createdAt
      updatedAt
      description
      notes
    }
  }
`
