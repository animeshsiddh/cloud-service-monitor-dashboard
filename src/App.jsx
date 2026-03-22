import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { NotificationProvider } from './context/NotificationContext'
import { RoleProvider } from './context/RoleContext'
import { DashboardApp } from './components/dashboard/DashboardApp'
import { dashboardTheme } from './theme/dashboardTheme'

export default function App() {
  return (
    <ThemeProvider theme={dashboardTheme}>
      <CssBaseline />
      <RoleProvider>
        <NotificationProvider>
          <DashboardApp />
        </NotificationProvider>
      </RoleProvider>
    </ThemeProvider>
  )
}
