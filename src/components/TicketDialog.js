import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Grid, CircularProgress
} from '@mui/material';

// Componente para el diálogo de creación/edición de tickets
const TicketDialog = ({ open, ticket, tiposSoporte, onClose, onSave, loading }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    id: null,
    cliente: '',
    direccion: '',
    telefono: '',
    descripcion: '',
    tipoSoporte: '',
    estado: 'pendiente'
  });
  
  // Cargar datos del ticket si se está editando
  useEffect(() => {
    if (ticket) {
      setFormData(ticket);
    } else {
      // Resetear formulario si es un nuevo ticket
      setFormData({
        id: null,
        cliente: '',
        direccion: '',
        telefono: '',
        descripcion: '',
        tipoSoporte: '',
        estado: 'pendiente'
      });
    }
  }, [ticket, open]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Validar formulario antes de guardar
  const isFormValid = () => {
    return (
      formData.cliente.trim() !== '' &&
      formData.direccion.trim() !== '' &&
      formData.telefono.trim() !== '' &&
      formData.descripcion.trim() !== '' &&
      formData.tipoSoporte.trim() !== ''
    );
  };
  
  // Guardar ticket
  const handleSave = () => {
    if (isFormValid()) {
      onSave(formData);
    }
  };

  return (
 <Dialog 
  open={open} 
  onClose={onClose} 
  maxWidth="md" 
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 2,
      boxShadow: '0 3px 14px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)'
    }
  }}
>
  <DialogTitle sx={{ borderBottom: '1px solid #f0f0f0', pb: 2 }}>
    {ticket ? 'Editar Ticket' : 'Nuevo Ticket'}
  </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Datos del cliente */}
          <Grid item xs={12} md={6}>
            <TextField
              name="cliente"
              label="Nombre del Cliente"
              value={formData.cliente}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="telefono"
              label="Número de Teléfono"
              value={formData.telefono}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="direccion"
              label="Dirección"
              value={formData.direccion}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
          
          {/* Datos del problema */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" required disabled={loading}>
              <InputLabel>Tipo de Soporte</InputLabel>
              <Select
                name="tipoSoporte"
                value={formData.tipoSoporte}
                onChange={handleChange}
                label="Tipo de Soporte"
              >
                {tiposSoporte.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="descripcion"
              label="Descripción del Problema"
              value={formData.descripcion}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={!isFormValid() || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketDialog;