const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3001; // Cambiado de 5000 a 3001

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Conectar a MySQL
db.connect(err => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
  
  // Crear tabla de tickets si no existe
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente VARCHAR(100) NOT NULL,
      direccion VARCHAR(200) NOT NULL,
      telefono VARCHAR(20) NOT NULL,
      descripcion TEXT NOT NULL,
      tipoSoporte VARCHAR(50) NOT NULL,
      estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error al crear tabla:', err);
    } else {
      console.log('Tabla de tickets creada o ya existente');
    }
  });
});

// Rutas API

// Obtener todos los tickets
app.get('/api/tickets', (req, res) => {
  const query = 'SELECT * FROM tickets ORDER BY fechaCreacion DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener tickets:', err);
      return res.status(500).json({ error: 'Error al obtener tickets' });
    }
    res.json(results);
  });
});

// Crear un nuevo ticket
app.post('/api/tickets', (req, res) => {
  const { cliente, direccion, telefono, descripcion, tipoSoporte } = req.body;
  
  if (!cliente || !direccion || !telefono || !descripcion || !tipoSoporte) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  
  const query = `
    INSERT INTO tickets (cliente, direccion, telefono, descripcion, tipoSoporte, estado)
    VALUES (?, ?, ?, ?, ?, 'pendiente')
  `;
  
  db.query(query, [cliente, direccion, telefono, descripcion, tipoSoporte], (err, result) => {
    if (err) {
      console.error('Error al crear ticket:', err);
      return res.status(500).json({ error: 'Error al crear ticket' });
    }
    
    // Obtener el ticket recién creado
    db.query('SELECT * FROM tickets WHERE id = ?', [result.insertId], (err, results) => {
      if (err) {
        console.error('Error al obtener ticket creado:', err);
        return res.status(500).json({ error: 'Error al obtener ticket creado' });
      }
      res.status(201).json(results[0]);
    });
  });
});

// Actualizar un ticket existente
app.put('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const { cliente, direccion, telefono, descripcion, tipoSoporte } = req.body;
  
  if (!cliente || !direccion || !telefono || !descripcion || !tipoSoporte) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  
  const query = `
    UPDATE tickets
    SET cliente = ?, direccion = ?, telefono = ?, descripcion = ?, tipoSoporte = ?
    WHERE id = ?
  `;
  
  db.query(query, [cliente, direccion, telefono, descripcion, tipoSoporte, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar ticket:', err);
      return res.status(500).json({ error: 'Error al actualizar ticket' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    
    // Obtener el ticket actualizado
    db.query('SELECT * FROM tickets WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error al obtener ticket actualizado:', err);
        return res.status(500).json({ error: 'Error al obtener ticket actualizado' });
      }
      res.json(results[0]);
    });
  });
});

// Actualizar el estado de un ticket
app.patch('/api/tickets/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!estado || !['pendiente', 'resuelto', 'cancelado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }
  
  const query = 'UPDATE tickets SET estado = ? WHERE id = ?';
  
  db.query(query, [estado, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar estado:', err);
      return res.status(500).json({ error: 'Error al actualizar estado' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    
    // Obtener el ticket actualizado
    db.query('SELECT * FROM tickets WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error al obtener ticket actualizado:', err);
        return res.status(500).json({ error: 'Error al obtener ticket actualizado' });
      }
      res.json(results[0]);
    });
  });
});

// Eliminar un ticket
app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM tickets WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar ticket:', err);
      return res.status(500).json({ error: 'Error al eliminar ticket' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    
    res.json({ message: 'Ticket eliminado correctamente' });
  });
});


// --- Servir React build (producción) ---
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});


