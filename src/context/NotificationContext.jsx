import CloseIcon from '@mui/icons-material/Close'
import { Alert, IconButton, Snackbar } from '@mui/material'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const NotificationContext = createContext({
  /** @param {string} message */
  notify: () => {},
})

export function NotificationProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('success')

  const notify = useCallback((msg, sev = 'success') => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        action={
          <IconButton color="inherit" onClick={() => setOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert
          severity={severity}
          variant="filled"
          onClose={() => setOpen(false)}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

/* eslint-disable react-refresh/only-export-components -- provider + hook pattern */
export function useNotify() {
  return useContext(NotificationContext).notify
}
