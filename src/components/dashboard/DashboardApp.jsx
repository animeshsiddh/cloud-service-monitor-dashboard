import { Box, Container, Paper, Tab, Tabs, Typography } from '@mui/material'
import { NetworkStatus } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { dashboardConfig } from '../../config/dashboardConfig'
import { hasRoleAccess } from '../../config/roles'
import { useRole } from '../../context/RoleContext'
import { SERVICES_QUERY } from '../../graphql/queries'
import { AppHeader } from './AppHeader'
import { IncidentsWorkspace } from './incidents/IncidentsWorkspace'
import { ServicesOverview } from './ServicesOverview'

export function DashboardApp() {
  const { role, setRole } = useRole()
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [activeTab, setActiveTab] = useState('services')

  const incidentsRefetchRef = useRef(null)

  const visibleTabs = useMemo(
    () => dashboardConfig.tabs.filter((t) => hasRoleAccess(t.roles, role)),
    [role],
  )

  const activeTabAllowed = visibleTabs.some((t) => t.id === activeTab)
  const effectiveTab = activeTabAllowed ? activeTab : visibleTabs[0]?.id ?? 'services'

  const handleRoleChange = useCallback(
    (nextRole) => {
      setRole(nextRole)
      const allowedIds = dashboardConfig.tabs
        .filter((t) => hasRoleAccess(t.roles, nextRole))
        .map((t) => t.id)
      setActiveTab((prev) =>
        allowedIds.includes(prev) ? prev : allowedIds[0] ?? 'services',
      )
    },
    [setRole],
  )

  const {
    data: svcData,
    loading: svcLoading,
    error: svcError,
    refetch: refetchServices,
    networkStatus: svcNetwork,
  } = useQuery(SERVICES_QUERY, {
    notifyOnNetworkStatusChange: true,
    pollInterval:
      effectiveTab === 'services' && autoRefresh
        ? dashboardConfig.autoRefreshIntervalMs
        : 0,
  })

  const services = svcData?.services

  const onManualRefresh = useCallback(() => {
    if (effectiveTab === 'services') void refetchServices()
    else incidentsRefetchRef.current?.refetch?.()
  }, [effectiveTab, refetchServices])

  const svcBackground =
    effectiveTab === 'services' &&
    svcNetwork === NetworkStatus.refetch &&
    svcData

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader
        role={role}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        onManualRefresh={onManualRefresh}
        onRoleChange={handleRoleChange}
      />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper elevation={0} variant="outlined" sx={{ mb: 2 }}>
          <Tabs
            value={effectiveTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
          >
            {visibleTabs.map((t) => (
              <Tab key={t.id} value={t.id} label={t.label} />
            ))}
          </Tabs>
          <Box sx={{ p: 2 }}>
            {effectiveTab === 'services' && (
              <>
                {svcBackground && (
                  <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
                    Updating…
                  </Typography>
                )}
                <ServicesOverview
                  services={services}
                  loading={svcLoading}
                  error={svcError}
                  onRetry={() => refetchServices()}
                />
              </>
            )}
            {effectiveTab === 'incidents' && (
              <IncidentsWorkspace
                ref={incidentsRefetchRef}
                active={effectiveTab === 'incidents'}
                autoRefresh={autoRefresh}
                services={services}
                role={role}
              />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
