import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { dashboardConfig } from '../../config/dashboardConfig'
import { serviceStatusColor } from '../../constants/statusVisuals'
import { formatRelativeTime } from '../../utils/relativeTime'

function statusLabel(status) {
  if (status === 'HEALTHY') return 'Healthy'
  if (status === 'DEGRADED') return 'Degraded'
  return 'Down'
}

export function ServicesOverview({ services, loading, error, onRetry }) {
  const showSkeleton = loading && (!services || services.length === 0)
  const { title, legend } = dashboardConfig.servicesOverview

  const lastUpdated = services?.length
    ? services.reduce(
        (latest, s) =>
          new Date(s.lastCheckedAt) > new Date(latest) ? s.lastCheckedAt : latest,
        services[0].lastCheckedAt,
      )
    : null

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            onRetry ? (
              <Button color="inherit" size="small" onClick={onRetry}>
                Retry
              </Button>
            ) : null
          }
        >
          {error.message}
        </Alert>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          minHeight: 200,
        }}
      >
        {showSkeleton
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} variant="outlined">
                <CardContent>
                  <Skeleton width="40%" />
                  <Skeleton sx={{ my: 1 }} height={32} />
                  <Skeleton />
                  <Skeleton width="60%" />
                </CardContent>
              </Card>
            ))
          : (services ?? []).map((s) => (
              <Card key={s.id} variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: `${serviceStatusColor[s.status]}.main`,
                      }}
                    />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {s.name}
                    </Typography>
                  </Stack>
                  <Chip
                    size="small"
                    label={statusLabel(s.status)}
                    color={serviceStatusColor[s.status] ?? 'default'}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {s.uptimePct}% Uptime
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last checked {formatRelativeTime(s.lastCheckedAt)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Open incidents: {s.openIncidentCount}
                  </Typography>
                </CardContent>
              </Card>
            ))}
      </Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mt: 2 }}
      >
        <Typography variant="caption" color="text.secondary">
          {lastUpdated ? `Last updated ${formatRelativeTime(lastUpdated)}` : ''}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {legend.map((l) => (
            <Stack key={l.status} direction="row" alignItems="center" spacing={0.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: `${l.colorKey}.main`,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {l.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
