import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import TicketDialog from './components/TicketDialog';
import { AppBar, Toolbar, Typography, Container, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';

// API URL
const API_URL = 'http://localhost:3001/api';

// Estados de tickets disponibles
const estadosTicket = ['pendiente', 'resuelto', 'cancelado'];

// Tipos de soporte disponibles
const tiposSoporte = ['Hardware', 'Software', 'Red', 'Técnico', 'Otro'];

// Tema de la aplicación
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#757575',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 400,
    },
    h5: {
      fontWeight: 400,
    },
    h6: {
      fontWeight: 400,
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500
        }
      }
    }
  }
});

function App() {
  const [tickets, setTickets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    resueltos: 0,
    cancelados: 0
  });

  // Cargar tickets desde el backend
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tickets`);
      
      if (!response.ok) {
        throw new Error('Error al cargar tickets');
      }
      
      const data = await response.json();
      setTickets(data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar tickets. Verifica la conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar tickets al iniciar
  useEffect(() => {
    fetchTickets();
  }, []);

  // Actualizar estadísticas cuando cambian los tickets
  useEffect(() => {
    const stats = {
      total: tickets.length,
      pendientes: tickets.filter(t => t.estado === 'pendiente').length,
      resueltos: tickets.filter(t => t.estado === 'resuelto').length,
      cancelados: tickets.filter(t => t.estado === 'cancelado').length
    };
    setEstadisticas(stats);
  }, [tickets]);

  // Abrir diálogo para crear un nuevo ticket
  const handleAddTicket = () => {
    setCurrentTicket(null);
    setOpenDialog(true);
  };

  // Abrir diálogo para editar un ticket existente
  const handleEditTicket = (ticket) => {
    setCurrentTicket(ticket);
    setOpenDialog(true);
  };

  // Guardar un ticket (nuevo o editado)
  const handleSaveTicket = async (ticketData) => {
    try {
      setLoading(true);
      
      let response;
      
      if (ticketData.id) {
        // Actualizar ticket existente
        response = await fetch(`${API_URL}/tickets/${ticketData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticketData),
        });
      } else {
        // Crear nuevo ticket
        response = await fetch(`${API_URL}/tickets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticketData),
        });
      }
      
      if (!response.ok) {
        throw new Error('Error al guardar ticket');
      }
      
      const savedTicket = await response.json();
      
      if (ticketData.id) {
        // Actualizar ticket en la lista
        setTickets(tickets.map(t => t.id === savedTicket.id ? savedTicket : t));
      } else {
        // Añadir nuevo ticket a la lista
        setTickets([savedTicket, ...tickets]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al guardar ticket. Verifica la conexión al servidor.');
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  // Actualizar el estado de un ticket
  const handleUpdateStatus = async (id, nuevoEstado) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/tickets/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar estado');
      }
      
      const updatedTicket = await response.json();
      setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar estado. Verifica la conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un ticket
  const handleDeleteTicket = async (id) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/tickets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar ticket');
      }
      
      setTickets(tickets.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al eliminar ticket. Verifica la conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Cerrar alerta de error
  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', color: 'text.primary', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
              Sistema de Tickets de Soporte DTM Jacaltenango
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Dashboard 
            estadisticas={estadisticas} 
            onAddTicket={handleAddTicket} 
          />
          
          <Paper sx={{ mt: 3, p: 2, position: 'relative' }}>
            {loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1
              }}>
                <CircularProgress />
              </Box>
            )}
            <TicketList 
              tickets={tickets} 
              estados={estadosTicket}
              onEditTicket={handleEditTicket}
              onUpdateStatus={handleUpdateStatus}
              onDeleteTicket={handleDeleteTicket}
            />
          </Paper>
        </Container>
        
        <TicketDialog 
          open={openDialog}
          ticket={currentTicket}
          tiposSoporte={tiposSoporte}
          onClose={() => setOpenDialog(false)}
          onSave={handleSaveTicket}
          loading={loading}
        />
        
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;