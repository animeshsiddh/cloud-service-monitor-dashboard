import { Link as MuiLink, Box, Chip, Stack, Typography } from '@mui/material'
import {
  incidentStatusChipColor,
  severityChipColor,
  severityLabel,
  serviceStatusColor,
  statusLabel,
} from '../../../constants/statusVisuals'
import { formatRelativeTime } from '../../../utils/relativeTime'

/**
 * Renders one table cell from column config + row + lookups.
 */
export function TableCellRenderer({
  column,
  row,
  serviceById,
  onTitleClick,
}) {
  const value = row[column.field]

  switch (column.type) {
    case 'text':
      return (
        <Typography variant="body2" color="text.primary">
          {value ?? '—'}
        </Typography>
      )
    case 'link':
      return (
        <MuiLink
          component="button"
          variant="body2"
          onClick={() => onTitleClick(row)}
          sx={{
            cursor: 'pointer',
            textAlign: 'left',
            border: 'none',
            background: 'none',
            p: 0,
            font: 'inherit',
          }}
        >
          {value}
        </MuiLink>
      )
    case 'serviceChip': {
      const svc = serviceById?.get(row.serviceId)
      const colorKey = svc ? serviceStatusColor[svc.status] ?? 'grey' : 'grey'
      const dotSx =
        colorKey === 'grey'
          ? { bgcolor: 'grey.500' }
          : { bgcolor: `${colorKey}.main` }
      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            component="span"
            sx={{ width: 8, height: 8, borderRadius: '50%', ...dotSx }}
          />
          <Typography variant="body2">{value}</Typography>
        </Stack>
      )
    }
    case 'badge':
      return (
        <Chip
          size="small"
          label={severityLabel[value] ?? value}
          color={severityChipColor[value] ?? 'default'}
        />
      )
    case 'statusChip':
      return (
        <Chip
          size="small"
          label={statusLabel[value] ?? value}
          color={incidentStatusChipColor[value] ?? 'default'}
        />
      )
    case 'relativeTime':
      return (
        <Typography variant="body2" color="text.secondary">
          {formatRelativeTime(value)}
        </Typography>
      )
    default:
      return (
        <Typography variant="body2">
          {value != null ? String(value) : '—'}
        </Typography>
      )
  }
}
