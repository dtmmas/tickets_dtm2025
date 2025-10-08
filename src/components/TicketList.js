import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, IconButton, Menu, MenuItem, Chip, Box
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Componente para mostrar la lista de tickets
const TicketList = ({ tickets, estados, onEditTicket, onUpdateStatus, onDeleteTicket }) => {
  // Estado para controlar el menú de opciones de cada ticket
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Estado para controlar el menú de cambio de estado
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  
  // Abrir menú de opciones
  const handleMenuOpen = (event, ticket) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicket(ticket);
  };
  
  // Cerrar menú de opciones
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTicket(null);
  };
  
  // Abrir menú de cambio de estado
  const handleStatusMenuOpen = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };
  
  // Cerrar menú de cambio de estado
  const handleStatusMenuClose = () => {
    setStatusAnchorEl(null);
  };
  
  // Editar ticket
  const handleEdit = () => {
    onEditTicket(selectedTicket);
    handleMenuClose();
  };
  
  // Eliminar ticket
  const handleDelete = () => {
    onDeleteTicket(selectedTicket.id);
    handleMenuClose();
  };
  
  // Cambiar estado del ticket
  const handleStatusChange = (nuevoEstado) => {
    onUpdateStatus(selectedTicket.id, nuevoEstado);
    handleStatusMenuClose();
    handleMenuClose();
  };
  
  // Obtener color según el estado del ticket
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'resuelto':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Listado de Tickets
      </Typography>
      
<TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
  <Table>
    <TableHead>
      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
        <TableCell>ID</TableCell>
        <TableCell>Cliente</TableCell>
        <TableCell>Descripción</TableCell>
        <TableCell>Tipo</TableCell>
        <TableCell>Fecha</TableCell>
        <TableCell>Estado</TableCell>
        <TableCell>Acciones</TableCell>
      </TableRow>
    </TableHead>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay tickets disponibles
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.cliente}</TableCell>
                  <TableCell>{ticket.descripcion}</TableCell>
                  <TableCell>{ticket.tipoSoporte}</TableCell>
                  <TableCell>{formatDate(ticket.fechaCreacion)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={ticket.estado.charAt(0).toUpperCase() + ticket.estado.slice(1)} 
                      color={getStatusColor(ticket.estado)}
                      onClick={(event) => {
                        setSelectedTicket(ticket);
                        handleStatusMenuOpen(event);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      aria-label="opciones" 
                      onClick={(event) => handleMenuOpen(event, ticket)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Menú de opciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>
      
      {/* Menú de cambio de estado */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={handleStatusMenuClose}
      >
        {estados.map((estado) => (
          <MenuItem 
            key={estado} 
            onClick={() => handleStatusChange(estado)}
            disabled={selectedTicket && selectedTicket.estado === estado}
          >
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default TicketList;