/**
 * Single source of truth for layout: tabs, table, filters, row actions, drawer.
 * Add columns / tabs / actions here without rewriting table or shell logic.
 */

export const ROLES = {
  ADMIN: 'Admin',
  OPERATOR: 'Operator',
  VIEWER: 'Viewer',
}

export const dashboardConfig = {
  appTitle: 'Cloud Service Monitor',

  tabs: [
    {
      id: 'services',
      label: 'Services',
      roles: [ROLES.ADMIN, ROLES.OPERATOR, ROLES.VIEWER],
    },
    {
      id: 'incidents',
      label: 'Incidents',
      roles: [ROLES.ADMIN, ROLES.OPERATOR],
    },
  ],

  servicesOverview: {
    title: 'Service Health Overview',
    legend: [
      { status: 'HEALTHY', label: 'Healthy', colorKey: 'success' },
      { status: 'DEGRADED', label: 'Degraded', colorKey: 'warning' },
      { status: 'DOWN', label: 'Down', colorKey: 'error' },
    ],
  },

  incidentTable: {
    pageSize: 10,
    columns: [
      { id: 'id', field: 'id', label: 'ID', type: 'text' },
      { id: 'title', field: 'title', label: 'Title', type: 'link' },
      {
        id: 'serviceName',
        field: 'serviceName',
        label: 'Service',
        type: 'serviceChip',
      },
      { id: 'severity', field: 'severity', label: 'Severity', type: 'badge' },
      { id: 'status', field: 'status', label: 'Status', type: 'statusChip' },
      { id: 'assignee', field: 'assignee', label: 'Assignee', type: 'text' },
      {
        id: 'createdAt',
        field: 'createdAt',
        label: 'Created',
        type: 'relativeTime',
      },
    ],
    rowActionsMenu: {
      items: [
        {
          id: 'acknowledge',
          label: 'Acknowledge',
          mutation: 'acknowledge',
          roles: [ROLES.ADMIN, ROLES.OPERATOR],
        },
        {
          id: 'resolve',
          label: 'Resolve',
          mutation: 'resolve',
          roles: [ROLES.ADMIN, ROLES.OPERATOR],
        },
      ],
    },
  },

  incidentFilters: [
    {
      id: 'severity',
      label: 'Severity',
      type: 'multiselect',
      graphField: 'severities',
      options: [
        { value: 'CRITICAL', label: 'Critical' },
        { value: 'HIGH', label: 'High' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'LOW', label: 'Low' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      graphField: 'statuses',
      options: [
        { value: 'OPEN', label: 'Open' },
        { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
        { value: 'RESOLVED', label: 'Resolved' },
      ],
    },
    {
      id: 'service',
      label: 'Service',
      type: 'singleselect',
      graphField: 'serviceId',
      optionsFromQuery: 'services',
    },
  ],

  incidentsToolbar: {
    actions: [
      {
        id: 'newIncident',
        label: '+ New Incident',
        type: 'dialog',
        roles: [ROLES.ADMIN, ROLES.OPERATOR],
      },
    ],
  },

  incidentPanel: {
    sections: [
      {
        id: 'meta',
        type: 'header',
        titleField: 'title',
        subtitleFields: ['id'],
      },
      {
        id: 'details',
        type: 'keyValue',
        rows: [
          {
            id: 'service',
            label: 'Service',
            field: 'serviceName',
            adornment: 'serviceDot',
          },
          {
            id: 'severity',
            label: 'Severity',
            field: 'severity',
            adornment: 'severityDot',
          },
          {
            id: 'status',
            label: 'Status',
            field: 'status',
            render: 'statusChip',
          },
          {
            id: 'assignee',
            label: 'Assigned to',
            field: 'assignee',
            adornment: 'person',
          },
          {
            id: 'created',
            label: 'Created',
            field: 'createdAt',
            render: 'relativeTime',
          },
          {
            id: 'updated',
            label: 'Updated',
            field: 'updatedAt',
            render: 'relativeTime',
          },
        ],
      },
      {
        id: 'description',
        type: 'textBlock',
        title: 'Description',
        field: 'description',
      },
      {
        id: 'notes',
        type: 'notes',
        title: 'Notes',
        field: 'notes',
      },
    ],
    footerActions: [
      {
        id: 'acknowledge',
        label: 'Acknowledge',
        mutation: 'acknowledge',
        variant: 'outlined',
        roles: [ROLES.ADMIN, ROLES.OPERATOR],
      },
      {
        id: 'resolve',
        label: 'Resolve',
        mutation: 'resolve',
        variant: 'contained',
        roles: [ROLES.ADMIN, ROLES.OPERATOR],
      },
    ],
  },

  autoRefreshIntervalMs: 30000,
  notesAutoSaveDebounceMs: 2000,
}
