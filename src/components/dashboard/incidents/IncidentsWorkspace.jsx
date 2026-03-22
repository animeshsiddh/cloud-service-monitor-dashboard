import { NetworkStatus } from '@apollo/client'
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  TablePagination,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { dashboardConfig } from '../../../config/dashboardConfig'
import { useNotify } from '../../../context/NotificationContext'
import {
  ACKNOWLEDGE_INCIDENT,
  RESOLVE_INCIDENT,
} from '../../../graphql/mutations'
import { INCIDENT_DETAIL_QUERY, INCIDENTS_QUERY } from '../../../graphql/queries'
import { ConfigurableFilters } from './ConfigurableFilters'
import { ConfigurableIncidentTable } from './ConfigurableIncidentTable'
import { IncidentDrawer } from './IncidentDrawer'
import { NewIncidentDialog } from './NewIncidentDialog'

const initialFilters = () => ({
  severity: [],
  status: [],
  service: '',
})

function EmptyIllustration({ title, body, actionLabel, onAction }) {
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {body}
      </Typography>
      {actionLabel && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

export const IncidentsWorkspace = forwardRef(function IncidentsWorkspace(
  { active, autoRefresh, services, role },
  ref,
) {
  const notify = useNotify()
  const pageSize = dashboardConfig.incidentTable.pageSize
  const [filterState, setFilterState] = useState(initialFilters)
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [newOpen, setNewOpen] = useState(false)

  const gqlFilter = useMemo(() => {
    const f = {}
    if (filterState.severity.length) f.severities = filterState.severity
    if (filterState.status.length) f.statuses = filterState.status
    if (filterState.service) f.serviceId = filterState.service
    return Object.keys(f).length ? f : undefined
  }, [filterState])

  const variables = useMemo(
    () => ({
      filter: gqlFilter,
      page: page + 1,
      pageSize,
    }),
    [gqlFilter, page, pageSize],
  )

  const { data, loading, error, refetch, networkStatus } = useQuery(
    INCIDENTS_QUERY,
    {
      variables,
      skip: !active,
      notifyOnNetworkStatusChange: true,
      pollInterval:
        active && autoRefresh ? dashboardConfig.autoRefreshIntervalMs : 0,
    },
  )

  useImperativeHandle(
    ref,
    () => ({
      refetch: () => refetch(),
    }),
    [refetch],
  )

  const { data: detailData } = useQuery(INCIDENT_DETAIL_QUERY, {
    variables: { id: selectedId },
    skip: !active || !selectedId,
  })

  const [ackMut] = useMutation(ACKNOWLEDGE_INCIDENT)
  const [resMut] = useMutation(RESOLVE_INCIDENT)

  const serviceById = useMemo(() => {
    const m = new Map()
    for (const s of services ?? []) m.set(s.id, s)
    return m
  }, [services])

  const rows = data?.incidents?.items ?? []
  const totalCount = data?.incidents?.totalCount ?? 0

  const hasActiveFilters = Boolean(
    filterState.severity.length ||
      filterState.status.length ||
      filterState.service,
  )

  const initialSkeleton = loading && !data
  const background =
    networkStatus === NetworkStatus.refetch && data && !initialSkeleton

  const onFilterChange = useCallback((id, value) => {
    setFilterState((prev) => ({ ...prev, [id]: value }))
    setPage(0)
  }, [])

  const onClearAll = useCallback(() => {
    setFilterState(initialFilters())
    setPage(0)
  }, [])

  const onTitleClick = useCallback((row) => {
    setSelectedId(row.id)
  }, [])

  const onRowAction = useCallback(
    async (item, row) => {
      try {
        if (item.mutation === 'acknowledge') {
          await ackMut({ variables: { id: row.id } })
          notify('Incident acknowledged')
        }
        if (item.mutation === 'resolve') {
          await resMut({ variables: { id: row.id } })
          notify('Incident resolved')
        }
      } catch {
        notify('Action failed', 'error')
      }
    },
    [ackMut, resMut, notify],
  )

  const onDrawerAction = useCallback(
    (kind) => {
      if (kind === 'acknowledge') notify('Incident acknowledged')
      else if (kind === 'resolve') notify('Incident resolved')
    },
    [notify],
  )

  const toolbarActions = dashboardConfig.incidentsToolbar.actions.map((a) => ({
    ...a,
    render:
      a.id === 'newIncident' ? (
        <Button
          key={a.id}
          variant="contained"
          size="small"
          onClick={() => setNewOpen(true)}
        >
          {a.label}
        </Button>
      ) : null,
  }))

  const detailIncident = detailData?.incident

  return (
    <Box sx={{ position: 'relative' }}>
      {background && (
        <LinearProgress
          sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}
        />
      )}
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error.message}
        </Alert>
      )}

      <ConfigurableFilters
        services={services}
        filterState={filterState}
        onChange={onFilterChange}
        onClearAll={onClearAll}
        toolbarActions={toolbarActions}
        role={role}
      />

      {!error && initialSkeleton && (
        <ConfigurableIncidentTable
          rows={[]}
          loading
          serviceById={serviceById}
          role={role}
          onTitleClick={onTitleClick}
          onRowAction={onRowAction}
        />
      )}

      {!error && !initialSkeleton && totalCount === 0 && hasActiveFilters && (
        <EmptyIllustration
          title="No Incidents Found"
          body="There are currently no incidents to display for these filters."
          actionLabel="Clear Filters"
          onAction={onClearAll}
        />
      )}

      {!error && !initialSkeleton && totalCount === 0 && !hasActiveFilters && (
        <EmptyIllustration
          title="No Incidents"
          body="There are currently no incidents in the system."
        />
      )}

      {!error && !initialSkeleton && totalCount > 0 && (
        <>
          <ConfigurableIncidentTable
            rows={rows}
            loading={false}
            serviceById={serviceById}
            role={role}
            onTitleClick={onTitleClick}
            onRowAction={onRowAction}
          />
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[pageSize]}
            onRowsPerPageChange={() => {}}
            labelDisplayedRows={({ from, to, count }) =>
              `Showing ${count === 0 ? 0 : from}-${to} of ${count}`
            }
          />
        </>
      )}

      <IncidentDrawer
        open={Boolean(selectedId) && active}
        incident={detailIncident}
        incidentId={selectedId}
        onClose={() => setSelectedId(null)}
        serviceById={serviceById}
        role={role}
        onActionComplete={onDrawerAction}
      />

      <NewIncidentDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        services={services}
        onCreated={() => {
          refetch()
          notify('Incident created')
        }}
      />
    </Box>
  )
})
