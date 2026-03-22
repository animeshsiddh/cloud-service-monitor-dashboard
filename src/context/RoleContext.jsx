import { createContext, useContext, useMemo, useState } from 'react'
import { ROLES } from '../config/dashboardConfig'

const RoleContext = createContext({
  role: ROLES.ADMIN,
  setRole: () => {},
})

export function RoleProvider({ children }) {
  const [role, setRole] = useState(ROLES.ADMIN)
  const value = useMemo(() => ({ role, setRole }), [role])
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

/* eslint-disable react-refresh/only-export-components -- provider + hook pattern */
export function useRole() {
  return useContext(RoleContext)
}
