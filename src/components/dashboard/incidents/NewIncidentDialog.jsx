import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { CREATE_INCIDENT } from '../../../graphql/mutations'

export function NewIncidentDialog({ open, onClose, services, onCreated }) {
  const [title, setTitle] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [severity, setSeverity] = useState('MEDIUM')
  const [description, setDescription] = useState('')
  const [create, { loading }] = useMutation(CREATE_INCIDENT)

  const handleClose = () => {
    if (!loading) {
      setTitle('')
      setServiceId('')
      setSeverity('MEDIUM')
      setDescription('')
      onClose()
    }
  }

  const submit = async () => {
    if (!title.trim() || !serviceId) return
    try {
      await create({
        variables: {
          input: {
            title: title.trim(),
            serviceId,
            severity,
            description: description.trim() || '—',
          },
        },
      })
      onCreated?.()
      handleClose()
    } catch {
      /* mutation error surfaced by Apollo / UI */
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New incident</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
        />
        <FormControl fullWidth required>
          <InputLabel>Service</InputLabel>
          <Select
            value={serviceId}
            label="Service"
            onChange={(e) => setServiceId(e.target.value)}
          >
            {services?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Severity</InputLabel>
          <Select
            value={severity}
            label="Severity"
            onChange={(e) => setSeverity(e.target.value)}
          >
            <MenuItem value="CRITICAL">Critical</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="LOW">Low</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={loading || !title.trim() || !serviceId}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
