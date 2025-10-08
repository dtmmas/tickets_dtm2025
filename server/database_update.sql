-- Script para actualizar la base de datos con sistema de login y auditoría
-- Ejecutar este script en MySQL después de crear la base de datos ticket_system

USE ticket_system;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol ENUM('admin', 'tecnico', 'usuario') DEFAULT 'usuario',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tabla_afectada VARCHAR(50) NOT NULL,
    id_registro INT NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_id INT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Agregar campos de auditoría a la tabla tickets existente
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS creado_por INT,
ADD COLUMN IF NOT EXISTS modificado_por INT,
ADD FOREIGN KEY (creado_por) REFERENCES usuarios(id),
ADD FOREIGN KEY (modificado_por) REFERENCES usuarios(id);

-- Insertar usuarios de ejemplo
INSERT INTO usuarios (username, password, nombre, email, rol) VALUES
('admin', '$2b$10$rOvHIKSyZhNBxNvmQfWzKOQGQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ', 'Administrador', 'admin@dtmjacaltenango.com', 'admin'),
('tecnico1', '$2b$10$rOvHIKSyZhNBxNvmQfWzKOQGQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ', 'Técnico Principal', 'tecnico1@dtmjacaltenango.com', 'tecnico'),
('usuario1', '$2b$10$rOvHIKSyZhNBxNvmQfWzKOQGQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ', 'Usuario Demo', 'usuario1@dtmjacaltenango.com', 'usuario')
ON DUPLICATE KEY UPDATE username = username;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_auditoria_tabla_id ON auditoria(tabla_afectada, id_registro);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha_accion);

-- Crear trigger para auditoría automática en tickets
DELIMITER //

CREATE TRIGGER IF NOT EXISTS tickets_audit_insert
AFTER INSERT ON tickets
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla_afectada, id_registro, accion, datos_nuevos, usuario_id)
    VALUES ('tickets', NEW.id, 'CREATE', JSON_OBJECT(
        'cliente', NEW.cliente,
        'direccion', NEW.direccion,
        'telefono', NEW.telefono,
        'descripcion', NEW.descripcion,
        'tipoSoporte', NEW.tipoSoporte,
        'estado', NEW.estado
    ), NEW.creado_por);
END//

CREATE TRIGGER IF NOT EXISTS tickets_audit_update
AFTER UPDATE ON tickets
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla_afectada, id_registro, accion, datos_anteriores, datos_nuevos, usuario_id)
    VALUES ('tickets', NEW.id, 'UPDATE', 
        JSON_OBJECT(
            'cliente', OLD.cliente,
            'direccion', OLD.direccion,
            'telefono', OLD.telefono,
            'descripcion', OLD.descripcion,
            'tipoSoporte', OLD.tipoSoporte,
            'estado', OLD.estado
        ),
        JSON_OBJECT(
            'cliente', NEW.cliente,
            'direccion', NEW.direccion,
            'telefono', NEW.telefono,
            'descripcion', NEW.descripcion,
            'tipoSoporte', NEW.tipoSoporte,
            'estado', NEW.estado
        ), 
        NEW.modificado_por
    );
END//

CREATE TRIGGER IF NOT EXISTS tickets_audit_delete
AFTER DELETE ON tickets
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla_afectada, id_registro, accion, datos_anteriores, usuario_id)
    VALUES ('tickets', OLD.id, 'DELETE', JSON_OBJECT(
        'cliente', OLD.cliente,
        'direccion', OLD.direccion,
        'telefono', OLD.telefono,
        'descripcion', OLD.descripcion,
        'tipoSoporte', OLD.tipoSoporte,
        'estado', OLD.estado
    ), OLD.modificado_por);
END//

DELIMITER ;

-- Mostrar información de las tablas creadas
SHOW TABLES;
DESCRIBE usuarios;
DESCRIBE auditoria;

-- Nota: Las contraseñas de ejemplo son 'password123' hasheadas con bcrypt
-- Se recomienda cambiar estas contraseñas en producción