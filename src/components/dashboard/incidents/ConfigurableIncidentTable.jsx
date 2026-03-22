import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { useState } from 'react'
import { dashboardConfig } from '../../../config/dashboardConfig'
import { hasRoleAccess } from '../../../config/roles'
import { TableCellRenderer } from './TableCellRenderer'

export function ConfigurableIncidentTable({
  rows,
  loading,
  serviceById,
  role,
  onTitleClick,
  onRowAction,
}) {
  const { columns, rowActionsMenu } = dashboardConfig.incidentTable
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuRow, setMenuRow] = useState(null)

  const visibleMenuItems = rowActionsMenu.items.filter((item) =>
    hasRoleAccess(item.roles, role),
  )

  const handleOpenMenu = (e, row) => {
    setMenuAnchor(e.currentTarget)
    setMenuRow(row)
  }

  const handleCloseMenu = () => {
    setMenuAnchor(null)
    setMenuRow(null)
  }

  const handlePick = (item) => {
    if (menuRow) onRowAction(item, menuRow)
    handleCloseMenu()
  }

  const showSkeleton = loading && (!rows || rows.length === 0)

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table size="small" stickyHeader sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id}>{col.label}</TableCell>
            ))}
            {visibleMenuItems.length > 0 && (
              <TableCell align="right" width={56}>
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {showSkeleton
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                  {visibleMenuItems.length > 0 && (
                    <TableCell>
                      <Skeleton variant="circular" width={32} height={32} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            : rows.map((row) => (
                <TableRow key={row.id} hover>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <TableCellRenderer
                        column={col}
                        row={row}
                        serviceById={serviceById}
                        onTitleClick={onTitleClick}
                      />
                    </TableCell>
                  ))}
                  {visibleMenuItems.length > 0 && (
                    <TableCell align="right">
                      <IconButton
                        aria-label="row actions"
                        size="small"
                        onClick={(e) => handleOpenMenu(e, row)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        {visibleMenuItems.map((item) => (
          <MenuItem key={item.id} onClick={() => handlePick(item)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
