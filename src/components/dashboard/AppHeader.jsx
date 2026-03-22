import RefreshIcon from '@mui/icons-material/Refresh'
import {
  AppBar,
  Button,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Toolbar,
  Typography,
} from '@mui/material'
import { dashboardConfig, ROLES } from '../../config/dashboardConfig'

export function AppHeader({
  role,
  autoRefresh,
  onAutoRefreshChange,
  onManualRefresh,
  onRoleChange,
}) {
  return (
    <AppBar position="static" elevation={0} color="primary">
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, minWidth: 200 }}>
          {dashboardConfig.appTitle}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="inherit">
            Role (demo)
          </Typography>
          <Select
            size="small"
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            sx={{
              minWidth: 120,
              color: 'inherit',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
            }}
          >
            {Object.values(ROLES).map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        <FormControlLabel
          control={
            <Switch
              checked={autoRefresh}
              onChange={(e) => onAutoRefreshChange(e.target.checked)}
              color="default"
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'common.white' } }}
            />
          }
          label={<Typography color="inherit">Auto-Refresh</Typography>}
        />
        <Button
          color="inherit"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onManualRefresh}
          sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
        >
          Refresh
        </Button>
      </Toolbar>
    </AppBar>
  )
}
