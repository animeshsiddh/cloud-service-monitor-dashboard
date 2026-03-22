import FilterListIcon from '@mui/icons-material/FilterList'
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { dashboardConfig } from '../../../config/dashboardConfig'
import { hasRoleAccess } from '../../../config/roles'
import { severityLabel, statusLabel } from '../../../constants/statusVisuals'

function labelForFilterValue(filterId, value) {
  if (filterId === 'severity') return severityLabel[value] ?? value
  if (filterId === 'status') return statusLabel[value] ?? value
  return value
}

export function ConfigurableFilters({
  services,
  filterState,
  onChange,
  onClearAll,
  toolbarActions,
  role,
}) {
  const filters = dashboardConfig.incidentFilters

  const serviceOptions =
    services?.map((s) => ({ value: s.id, label: s.name })) ?? []

  const chips = []
  for (const f of filters) {
    if (f.type === 'multiselect') {
      for (const v of filterState[f.id] ?? []) {
        chips.push({
          key: `${f.id}-${v}`,
          filterId: f.id,
          value: v,
          label: `${f.label}: ${labelForFilterValue(f.id, v)}`,
        })
      }
    } else if (f.type === 'singleselect' && filterState[f.id]) {
      const opt = serviceOptions.find((o) => o.value === filterState[f.id])
      chips.push({
        key: `${f.id}-${filterState[f.id]}`,
        filterId: f.id,
        value: filterState[f.id],
        label: `${f.label}: ${opt?.label ?? filterState[f.id]}`,
      })
    }
  }

  const hasFilters = chips.length > 0

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        flexWrap="wrap"
        useFlexGap
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterListIcon color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Filters:
          </Typography>
        </Stack>

        {filters.map((f) => {
          if (f.type === 'multiselect') {
            return (
              <FormControl key={f.id} size="small" sx={{ minWidth: 160 }}>
                <InputLabel id={`${f.id}-lbl`}>{f.label}</InputLabel>
                <Select
                  labelId={`${f.id}-lbl`}
                  multiple
                  value={filterState[f.id] ?? []}
                  onChange={(e) =>
                    onChange(f.id, e.target.value)
                  }
                  input={<OutlinedInput label={f.label} />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {f.options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
          }
          if (f.type === 'singleselect') {
            return (
              <FormControl key={f.id} size="small" sx={{ minWidth: 160 }}>
                <InputLabel id={`${f.id}-lbl`}>{f.label}</InputLabel>
                <Select
                  labelId={`${f.id}-lbl`}
                  value={filterState[f.id] ?? ''}
                  label={f.label}
                  onChange={(e) =>
                    onChange(f.id, e.target.value || null)
                  }
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {serviceOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
          }
          return null
        })}

        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          {hasFilters && (
            <Button size="small" onClick={onClearAll}>
              Clear All
            </Button>
          )}
          {toolbarActions
            ?.filter((action) => action.render)
            .map((action) =>
              hasRoleAccess(action.roles, role) ? (
                <span key={action.id}>{action.render}</span>
              ) : null,
            )}
        </Stack>
      </Stack>

      {hasFilters && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {chips.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              onDelete={() => {
                if (Array.isArray(filterState[c.filterId])) {
                  const next = filterState[c.filterId].filter((x) => x !== c.value)
                  onChange(c.filterId, next)
                } else {
                  onChange(c.filterId, null)
                }
              }}
              size="small"
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
