import CheckIcon from '@mui/icons-material/Check'
import {
  Box,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation } from '@apollo/client/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { dashboardConfig } from '../../../config/dashboardConfig'
import { UPDATE_INCIDENT_NOTES } from '../../../graphql/mutations'

/**
 * Controlled notes with debounced auto-save (no Save button).
 * @param {{ incident: { id: string, notes: string } }} props
 */
export function IncidentNotesField({ incident }) {
  const debounceMs = dashboardConfig.notesAutoSaveDebounceMs
  const [mutate] = useMutation(UPDATE_INCIDENT_NOTES)

  const [draft, setDraft] = useState(incident.notes)
  const draftRef = useRef(incident.notes)
  const baselineRef = useRef(incident.notes)
  const timerRef = useRef(null)
  const saveGenRef = useRef(0)

  /** @type {['saved'|'dirty'|'saving', import('react').Dispatch<import('react').SetStateAction<'saved'|'dirty'|'saving'>>]} */
  const [indicator, setIndicator] = useState('saved')

  const flushSave = useCallback(async () => {
    const toSave = draftRef.current
    if (toSave === baselineRef.current) {
      setIndicator('saved')
      return
    }
    setIndicator('saving')
    const gen = ++saveGenRef.current
    try {
      await mutate({ variables: { id: incident.id, notes: toSave } })
      if (gen !== saveGenRef.current) return
      baselineRef.current = toSave
      if (draftRef.current !== baselineRef.current) {
        setIndicator('dirty')
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          flushSave()
        }, debounceMs)
      } else {
        setIndicator('saved')
      }
    } catch {
      if (gen === saveGenRef.current) setIndicator('dirty')
    }
  }, [debounceMs, incident.id, mutate])

  useEffect(() => {
    clearTimeout(timerRef.current)
    const n = incident.notes
    draftRef.current = n
    baselineRef.current = n
    setDraft(n)
    setIndicator('saved')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when switching incident
  }, [incident.id])

  useEffect(
    () => () => {
      clearTimeout(timerRef.current)
    },
    [],
  )

  const onChange = (e) => {
    const v = e.target.value
    draftRef.current = v
    setDraft(v)
    const dirty = v !== baselineRef.current
    setIndicator(dirty ? 'dirty' : 'saved')
    clearTimeout(timerRef.current)
    if (dirty) {
      timerRef.current = setTimeout(() => {
        flushSave()
      }, debounceMs)
    }
  }

  const statusLabel =
    indicator === 'saving'
      ? 'Saving…'
      : indicator === 'dirty'
        ? 'Unsaved changes'
        : 'Saved'

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Notes
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={4}
        value={draft}
        onChange={onChange}
        placeholder="Add internal notes…"
      />
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="flex-end"
        sx={{ mt: 1, minHeight: 24 }}
      >
        {indicator === 'saving' && <CircularProgress size={16} />}
        {indicator === 'saved' && <CheckIcon color="success" sx={{ fontSize: 18 }} />}
        <Typography variant="caption" color="text.secondary">
          {statusLabel}
        </Typography>
      </Stack>
    </Box>
  )
}
