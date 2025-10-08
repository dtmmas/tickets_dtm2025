import React from 'react';
import { Grid, Paper, Typography, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Componente para mostrar una tarjeta de estadística
// ... existing code ...
// Componente para mostrar una tarjeta de estadística
const StatCard = ({ title, value, color }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 100,
      bgcolor: 'white',
      borderTop: `3px solid ${color}`,
      color: 'text.primary',
    }}
  >
    <Typography component="h2" variant="subtitle1" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);
// ... existing code ...

// Componente principal del Dashboard
const Dashboard = ({ estadisticas, onAddTicket }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography component="h1" variant="h4">
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={onAddTicket}
        >
          Nuevo Ticket
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Tarjeta de tickets totales */}
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Total de Tickets" 
            value={estadisticas.total} 
            color="#2196f3" 
          />
        </Grid>
        
        {/* Tarjeta de tickets pendientes */}
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Pendientes" 
            value={estadisticas.pendientes} 
            color="#ff9800" 
          />
        </Grid>
        
        {/* Tarjeta de tickets resueltos */}
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Resueltos" 
            value={estadisticas.resueltos} 
            color="#4caf50" 
          />
        </Grid>
        
        {/* Tarjeta de tickets cancelados */}
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Cancelados" 
            value={estadisticas.cancelados} 
            color="#f44336" 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;