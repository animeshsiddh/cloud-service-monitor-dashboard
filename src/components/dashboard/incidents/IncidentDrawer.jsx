import CloseIcon from '@mui/icons-material/Close'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { useMutation } from '@apollo/client/react'
import { dashboardConfig } from '../../../config/dashboardConfig'
import { hasRoleAccess } from '../../../config/roles'
import {
  incidentStatusChipColor,
  severityChipColor,
  severityLabel,
  serviceStatusColor,
  statusLabel,
} from '../../../constants/statusVisuals'
import {
  ACKNOWLEDGE_INCIDENT,
  RESOLVE_INCIDENT,
} from '../../../graphql/mutations'
import { formatRelativeTime } from '../../../utils/relativeTime'
import { IncidentNotesField } from './IncidentNotesField'

function KeyValueRow({ row, incident, serviceById }) {
  const value = incident[row.field]
  let content
  if (row.render === 'statusChip') {
    content = (
      <Chip
        size="small"
        label={statusLabel[value] ?? value}
        color={incidentStatusChipColor[value] ?? 'default'}
      />
    )
  } else if (row.render === 'relativeTime') {
    content = (
      <Typography variant="body2" color="text.secondary">
        {formatRelativeTime(value)}
      </Typography>
    )
  } else if (row.adornment === 'serviceDot') {
    const svc = serviceById?.get(incident.serviceId)
    const ck = svc ? serviceStatusColor[svc.status] ?? 'grey' : 'grey'
    const dotSx =
      ck === 'grey' ? { bgcolor: 'grey.500' } : { bgcolor: `${ck}.main` }
    content = (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', ...dotSx }} />
        <Typography variant="body2">{value}</Typography>
      </Stack>
    )
  } else if (row.adornment === 'severityDot') {
    const ck = severityChipColor[value] ?? 'grey'
    const dotSx =
      ck === 'grey' ? { bgcolor: 'grey.500' } : { bgcolor: `${ck}.main` }
    content = (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', ...dotSx }} />
        <Typography variant="body2">
          {severityLabel[value] ?? value}
        </Typography>
      </Stack>
    )
  } else if (row.adornment === 'person') {
    content = (
      <Stack direction="row" alignItems="center" spacing={1}>
        <PersonOutlineIcon fontSize="small" color="action" />
        <Typography variant="body2">{value || '—'}</Typography>
      </Stack>
    )
  } else {
    content = <Typography variant="body2">{value ?? '—'}</Typography>
  }

  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ width: 120, flexShrink: 0 }}
      >
        {row.label}
      </Typography>
      <Box sx={{ flex: 1 }}>{content}</Box>
    </Stack>
  )
}

function PanelSections({ incident, serviceById }) {
  const { sections } = dashboardConfig.incidentPanel
  return (
    <Stack spacing={2} sx={{ px: 2, py: 2, flex: 1, overflow: 'auto' }}>
      {sections.map((section) => {
        if (section.type === 'header') {
          return (
            <Box key={section.id}>
              <Typography variant="h6" gutterBottom>
                {incident[section.titleField]}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {section.subtitleFields?.map((f) => (
                  <Chip key={f} size="small" label={incident[f]} />
                ))}
                <Chip
                  size="small"
                  label={statusLabel[incident.status]}
                  color={incidentStatusChipColor[incident.status] ?? 'default'}
                />
              </Stack>
            </Box>
          )
        }
        if (section.type === 'keyValue') {
          return (
            <Box key={section.id}>
              {section.rows.map((row) => (
                <KeyValueRow
                  key={row.id}
                  row={row}
                  incident={incident}
                  serviceById={serviceById}
                />
              ))}
            </Box>
          )
        }
        if (section.type === 'textBlock') {
          return (
            <Box key={section.id}>
              <Typography variant="subtitle2" gutterBottom>
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {incident[section.field]}
              </Typography>
            </Box>
          )
        }
        if (section.type === 'notes') {
          return (
            <Box key={section.id}>
              <IncidentNotesField incident={incident} />
            </Box>
          )
        }
        return null
      })}
    </Stack>
  )
}

export function IncidentDrawer({
  open,
  incident,
  incidentId,
  onClose,
  serviceById,
  role,
  onActionComplete,
}) {
  const { footerActions } = dashboardConfig.incidentPanel
  const [ack] = useMutation(ACKNOWLEDGE_INCIDENT)
  const [resolve] = useMutation(RESOLVE_INCIDENT)

  const loading = Boolean(open && incidentId && !incident)

  const runMutation = async (mutationKey, id) => {
    if (mutationKey === 'acknowledge') {
      await ack({ variables: { id } })
      onActionComplete?.('acknowledge')
    }
    if (mutationKey === 'resolve') {
      await resolve({ variables: { id } })
      onActionComplete?.('resolve')
    }
  }

  const visibleFooter = footerActions.filter((a) =>
    hasRoleAccess(a.roles, role),
  )

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
    >
      <>
        <Toolbar
          sx={{
            bgcolor: 'primary.dark',
            color: 'primary.contrastText',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {incident?.id ?? incidentId ?? ''}
          </Typography>
          <IconButton
            color="inherit"
            edge="end"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && incident && (
          <>
            <PanelSections incident={incident} serviceById={serviceById} />
            <Divider />
            <Stack direction="row" spacing={1} sx={{ p: 2 }}>
              {visibleFooter.map((a) => (
                <Button
                  key={a.id}
                  variant={a.variant === 'contained' ? 'contained' : 'outlined'}
                  disabled={
                    (a.mutation === 'acknowledge' &&
                      incident.status !== 'OPEN') ||
                    (a.mutation === 'resolve' &&
                      incident.status === 'RESOLVED')
                  }
                  onClick={() => runMutation(a.mutation, incident.id)}
                >
                  {a.label}
                </Button>
              ))}
            </Stack>
          </>
        )}
      </>
    </Drawer>
  )
}
