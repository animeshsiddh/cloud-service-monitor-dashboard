import { gql } from '@apollo/client'

export const SERVICES_QUERY = gql`
  query Services {
    services {
      id
      name
      status
      uptimePct
      lastCheckedAt
      openIncidentCount
    }
  }
`

export const INCIDENTS_QUERY = gql`
  query Incidents($filter: IncidentFiltersInput, $page: Int!, $pageSize: Int!) {
    incidents(filter: $filter, page: $page, pageSize: $pageSize) {
      totalCount
      items {
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
  }
`

export const INCIDENT_DETAIL_QUERY = gql`
  query IncidentDetail($id: ID!) {
    incident(id: $id) {
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
