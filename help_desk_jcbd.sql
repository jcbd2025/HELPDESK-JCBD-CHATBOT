-- =====================================================
-- SCRIPT DE INICIALIZACIÓN - HELP DESK JCBD TECHNOLOGY
-- =====================================================

DROP DATABASE IF EXISTS help_desk_jcbd;
CREATE DATABASE help_desk_jcbd CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE help_desk_jcbd;

-- =====================================================
-- TABLA: entidades
-- =====================================================
CREATE TABLE `entidades` (
  `id_entidad` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_entidad` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_entidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `entidades` (`nombre_entidad`, `descripcion`) VALUES
('Departamento de TI', 'Departamento de Tecnologías de la Información'),
('Recursos Humanos', 'Departamento de gestión de personal'),
('Contabilidad', 'Departamento financiero y contable'),
('Operaciones', 'Departamento de operaciones generales');

-- =====================================================
-- TABLA: categorias
-- =====================================================
CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categorias` (`nombre_categoria`, `descripcion`) VALUES
('Hardware', 'Problemas relacionados con equipos físicos'),
('Software', 'Problemas relacionados con programas y sistemas'),
('Red', 'Problemas de conectividad y redes'),
('Cuentas', 'Gestión de cuentas y permisos de usuarios'),
('WhatsApp', 'Consultas y tickets generados desde WhatsApp');

-- =====================================================
-- TABLA: grupos
-- =====================================================
CREATE TABLE `grupos` (
  `id_grupo` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_grupo` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_grupo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `grupos` (`nombre_grupo`, `descripcion`) VALUES
('Soporte Técnico Nivel 1', 'Primer nivel de soporte técnico'),
('Soporte Técnico Nivel 2', 'Segundo nivel de soporte técnico'),
('Administradores', 'Grupo de administradores del sistema');

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL UNIQUE,
  `telefono` varchar(20) DEFAULT NULL,
  `nombre_usuario` varchar(50) NOT NULL UNIQUE,
  `contraseña` varchar(255) NOT NULL,
  `rol` enum('administrador', 'tecnico', 'usuario') NOT NULL DEFAULT 'usuario',
  `estado` enum('activo', 'inactivo', 'suspendido') NOT NULL DEFAULT 'activo',
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_entidad1` int(11) DEFAULT NULL,
  `whatsapp_numero` varchar(20) DEFAULT NULL,
  `ultimo_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  KEY `fk_usuarios_entidad` (`id_entidad1`),
  CONSTRAINT `fk_usuarios_entidad` FOREIGN KEY (`id_entidad1`) REFERENCES `entidades` (`id_entidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Datos iniciales de usuarios
INSERT INTO `usuarios` (`nombre_completo`, `correo`, `telefono`, `nombre_usuario`, `contraseña`, `rol`, `estado`, `id_entidad1`, `whatsapp_numero`) VALUES
('Admin Sistema', 'admin@jcbd.com', '123456789', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..e', 'administrador', 'activo', 1, '+573001234567'),
('Técnico Principal', 'tecnico@jcbd.com', '123456789', 'tecnico1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..e', 'tecnico', 'activo', 1, '+573001234568'),
('Usuario Demo', 'usuario@jcbd.com', '123456789', 'usuario1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..e', 'usuario', 'activo', 2, '+573001234569');

-- =====================================================
-- TABLA: tickets
-- =====================================================
CREATE TABLE `tickets` (
  `id_ticket` int(11) NOT NULL AUTO_INCREMENT,
  `prioridad` enum('Baja', 'Media', 'Alta', 'Crítica') NOT NULL DEFAULT 'Media',
  `estado_ticket` enum('nuevo', 'asignado', 'en_progreso', 'resuelto', 'cerrado', 'reabierto') NOT NULL DEFAULT 'nuevo',
  `tipo` enum('incidencia', 'requerimiento', 'consulta') NOT NULL DEFAULT 'consulta',
  `titulo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_categoria1` int(11) DEFAULT NULL,
  `id_grupo1` int(11) DEFAULT NULL,
  `id_tecnico_asignado` int(11) DEFAULT NULL,
  `id_usuario_reporta` int(11) NOT NULL,
  `contador_reaperturas` int(11) DEFAULT 0,
  `origen` enum('web', 'whatsapp', 'email', 'telefono') DEFAULT 'web',
  `whatsapp_conversation_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_ticket`),
  KEY `fk_tickets_categoria` (`id_categoria1`),
  KEY `fk_tickets_grupo` (`id_grupo1`),
  KEY `fk_tickets_tecnico` (`id_tecnico_asignado`),
  KEY `fk_tickets_usuario` (`id_usuario_reporta`),
  CONSTRAINT `fk_tickets_categoria` FOREIGN KEY (`id_categoria1`) REFERENCES `categorias` (`id_categoria`),
  CONSTRAINT `fk_tickets_grupo` FOREIGN KEY (`id_grupo1`) REFERENCES `grupos` (`id_grupo`),
  CONSTRAINT `fk_tickets_tecnico` FOREIGN KEY (`id_tecnico_asignado`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `fk_tickets_usuario` FOREIGN KEY (`id_usuario_reporta`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLA: mensajes (para chat y comunicación)
-- =====================================================
CREATE TABLE `mensajes` (
  `id_mensaje` int(11) NOT NULL AUTO_INCREMENT,
  `id_ticket` int(11) NOT NULL,
  `remitente_id` int(11) DEFAULT NULL,
  `remitente_tipo` enum('usuario', 'tecnico', 'sistema', 'whatsapp') NOT NULL DEFAULT 'usuario',
  `remitente_nombre` varchar(100) DEFAULT NULL,
  `texto` text NOT NULL,
  `tipo_mensaje` enum('comentario', 'solucion', 'escalacion', 'whatsapp_in', 'whatsapp_out') DEFAULT 'comentario',
  `metadata` json DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `leido` boolean DEFAULT FALSE,
  `whatsapp_message_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_mensaje`),
  KEY `fk_mensajes_ticket` (`id_ticket`),
  KEY `fk_mensajes_remitente` (`remitente_id`),
  CONSTRAINT `fk_mensajes_ticket` FOREIGN KEY (`id_ticket`) REFERENCES `tickets` (`id_ticket`) ON DELETE CASCADE,
  CONSTRAINT `fk_mensajes_remitente` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLA: integracion_whatsapp
-- =====================================================
CREATE TABLE `integracion_whatsapp` (
  `id_integracion` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `whatsapp_numero` varchar(20) NOT NULL,
  `nombre_contacto` varchar(100) DEFAULT NULL,
  `ultimo_estado` enum('activo', 'inactivo', 'bloqueado') DEFAULT 'activo',
  `ultima_interaccion` timestamp NULL DEFAULT NULL,
  `conversation_id` varchar(100) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_integracion`),
  UNIQUE KEY `unique_whatsapp_numero` (`whatsapp_numero`),
  KEY `fk_integracion_usuario` (`usuario_id`),
  CONSTRAINT `fk_integracion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLA: adjuntos_tickets
-- =====================================================
CREATE TABLE `adjuntos_tickets` (
  `id_adjunto` int(11) NOT NULL AUTO_INCREMENT,
  `id_ticket1` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `tipo_archivo` varchar(50) DEFAULT NULL,
  `tamano` int(11) DEFAULT NULL COMMENT 'Tamaño en bytes',
  `fecha_subida` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_adjunto`),
  KEY `fk_adjuntos_ticket` (`id_ticket1`),
  CONSTRAINT `fk_adjuntos_ticket` FOREIGN KEY (`id_ticket1`) REFERENCES `tickets` (`id_ticket`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLA: historial_tickets
-- =====================================================
CREATE TABLE `historial_tickets` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `id_ticket2` int(11) NOT NULL,
  `campo_modificado` varchar(100) NOT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `modificado_por` int(11) DEFAULT NULL,
  `nombre_modificador` varchar(100) DEFAULT NULL,
  `rol_modificador` varchar(50) DEFAULT NULL,
  `fecha_modificacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comentario_reapertura` text DEFAULT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `fk_historial_ticket` (`id_ticket2`),
  KEY `fk_historial_usuario` (`modificado_por`),
  CONSTRAINT `fk_historial_ticket` FOREIGN KEY (`id_ticket2`) REFERENCES `tickets` (`id_ticket`) ON DELETE CASCADE,
  CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLA: configuracion_sistema
-- =====================================================
CREATE TABLE `configuracion_sistema` (
  `id_config` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL UNIQUE,
  `valor` text DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `tipo` enum('string', 'number', 'boolean', 'json') DEFAULT 'string',
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_config`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Configuraciones iniciales
INSERT INTO `configuracion_sistema` (`clave`, `valor`, `descripcion`, `tipo`) VALUES
('whatsapp_api_enabled', 'false', 'Habilitar integración con WhatsApp API', 'boolean'),
('whatsapp_webhook_url', '', 'URL del webhook para WhatsApp', 'string'),
('twilio_account_sid', '', 'Account SID de Twilio', 'string'),
('twilio_auth_token', '', 'Auth Token de Twilio', 'string'),
('whatsapp_phone_number', '', 'Número de teléfono de WhatsApp Business', 'string'),
('auto_assign_tickets', 'true', 'Asignar tickets automáticamente', 'boolean'),
('default_ticket_priority', 'Media', 'Prioridad por defecto para nuevos tickets', 'string');

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para registrar creación de tickets
DELIMITER $$
CREATE TRIGGER `after_ticket_insert` AFTER INSERT ON `tickets` FOR EACH ROW 
BEGIN
    DECLARE usuario_reporta_nombre VARCHAR(100);
    DECLARE usuario_reporta_rol VARCHAR(100);
    
    SELECT nombre_completo, rol INTO usuario_reporta_nombre, usuario_reporta_rol 
    FROM usuarios WHERE id_usuario = NEW.id_usuario_reporta;
    
    INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, 
                                 valor_nuevo, modificado_por, nombre_modificador, rol_modificador)
    VALUES (NEW.id_ticket, 'ticket_creado', NULL, 
           'Ticket creado con todos los campos',
           NEW.id_usuario_reporta, usuario_reporta_nombre, usuario_reporta_rol);
END$$

-- Trigger para registrar actualizaciones de tickets
CREATE TRIGGER `after_ticket_update` AFTER UPDATE ON `tickets` FOR EACH ROW 
BEGIN
    DECLARE user_id INT;
    DECLARE user_name VARCHAR(100);
    DECLARE user_rol VARCHAR(100);
    
    -- Obtener información del usuario que modifica
    SET user_id = IFNULL(NEW.id_tecnico_asignado, @current_user_id);
    IF user_id IS NULL THEN
        SET user_id = 1;
        SET user_name = 'Sistema';
        SET user_rol = 'sistema';
    ELSE
        SELECT nombre_completo, rol INTO user_name, user_rol FROM usuarios WHERE id_usuario = user_id;
    END IF;
    
    -- Registrar cambios en estado
    IF (NEW.estado_ticket != OLD.estado_ticket) THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'estado', OLD.estado_ticket, NEW.estado_ticket, 
               user_id, user_name, user_rol);
    END IF;
    
    -- Registrar cambios en prioridad
    IF (NEW.prioridad != OLD.prioridad) THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'prioridad', OLD.prioridad, NEW.prioridad, 
               user_id, user_name, user_rol);
    END IF;
    
    -- Registrar asignación de técnico
    IF (NEW.id_tecnico_asignado != OLD.id_tecnico_asignado) OR 
       (NEW.id_tecnico_asignado IS NULL AND OLD.id_tecnico_asignado IS NOT NULL) OR 
       (NEW.id_tecnico_asignado IS NOT NULL AND OLD.id_tecnico_asignado IS NULL) THEN
        
        DECLARE old_tecnico_nombre VARCHAR(100) DEFAULT 'Sin asignar';
        DECLARE new_tecnico_nombre VARCHAR(100) DEFAULT 'Sin asignar';
        
        IF OLD.id_tecnico_asignado IS NOT NULL THEN
            SELECT nombre_completo INTO old_tecnico_nombre FROM usuarios WHERE id_usuario = OLD.id_tecnico_asignado;
        END IF;
        
        IF NEW.id_tecnico_asignado IS NOT NULL THEN
            SELECT nombre_completo INTO new_tecnico_nombre FROM usuarios WHERE id_usuario = NEW.id_tecnico_asignado;
        END IF;
        
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'técnico_asignado', old_tecnico_nombre, new_tecnico_nombre, 
               user_id, user_name, user_rol);
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- DATOS DE PRUEBA
-- =====================================================

-- Tickets de ejemplo
INSERT INTO `tickets` (`prioridad`, `estado_ticket`, `tipo`, `titulo`, `descripcion`, `ubicacion`, `id_categoria1`, `id_grupo1`, `id_tecnico_asignado`, `id_usuario_reporta`, `origen`) VALUES
('Alta', 'nuevo', 'incidencia', 'Computadora no enciende', 'El equipo del usuario no muestra señal de vida al presionar el botón de encendido', 'Oficina 101', 1, 1, 2, 3, 'web'),
('Media', 'asignado', 'requerimiento', 'Instalación de software', 'El usuario requiere la instalación de Adobe Photoshop para edición de imágenes', 'Oficina 205', 2, 2, 2, 3, 'web'),
('Baja', 'nuevo', 'consulta', 'Consulta sobre WhatsApp', 'Usuario pregunta sobre funcionalidades del sistema', NULL, 5, 1, NULL, 3, 'whatsapp');

-- Mensajes de ejemplo
INSERT INTO `mensajes` (`id_ticket`, `remitente_id`, `remitente_tipo`, `remitente_nombre`, `texto`, `tipo_mensaje`) VALUES
(1, 3, 'usuario', 'Usuario Demo', 'Mi computadora no enciende desde esta mañana', 'comentario'),
(1, 2, 'tecnico', 'Técnico Principal', 'Revisaré el equipo en los próximos 30 minutos', 'comentario'),
(2, 3, 'usuario', 'Usuario Demo', 'Necesito Photoshop para el proyecto de marketing', 'comentario'),
(3, 3, 'usuario', 'Usuario Demo', 'Hola, tengo una pregunta sobre el sistema', 'whatsapp_in');

-- Integración WhatsApp de ejemplo
INSERT INTO `integracion_whatsapp` (`usuario_id`, `whatsapp_numero`, `nombre_contacto`, `ultimo_estado`, `conversation_id`) VALUES
(3, '+573001234569', 'Usuario Demo', 'activo', 'conv_001');

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para tickets con información completa
CREATE VIEW `vista_tickets_completa` AS
SELECT 
    t.id_ticket,
    t.titulo,
    t.descripcion,
    t.prioridad,
    t.estado_ticket,
    t.tipo,
    t.fecha_creacion,
    t.fecha_actualizacion,
    t.origen,
    u_reporta.nombre_completo AS usuario_reporta,
    u_reporta.correo AS correo_usuario,
    u_tecnico.nombre_completo AS tecnico_asignado,
    c.nombre_categoria AS categoria,
    g.nombre_grupo AS grupo,
    e.nombre_entidad AS entidad
FROM tickets t
LEFT JOIN usuarios u_reporta ON t.id_usuario_reporta = u_reporta.id_usuario
LEFT JOIN usuarios u_tecnico ON t.id_tecnico_asignado = u_tecnico.id_usuario
LEFT JOIN categorias c ON t.id_categoria1 = c.id_categoria
LEFT JOIN grupos g ON t.id_grupo1 = g.id_grupo
LEFT JOIN entidades e ON u_reporta.id_entidad1 = e.id_entidad;

-- Vista para estadísticas de tickets
CREATE VIEW `vista_estadisticas_tickets` AS
SELECT 
    COUNT(*) AS total_tickets,
    SUM(CASE WHEN estado_ticket = 'nuevo' THEN 1 ELSE 0 END) AS tickets_nuevos,
    SUM(CASE WHEN estado_ticket = 'asignado' THEN 1 ELSE 0 END) AS tickets_asignados,
    SUM(CASE WHEN estado_ticket = 'en_progreso' THEN 1 ELSE 0 END) AS tickets_en_progreso,
    SUM(CASE WHEN estado_ticket = 'resuelto' THEN 1 ELSE 0 END) AS tickets_resueltos,
    SUM(CASE WHEN estado_ticket = 'cerrado' THEN 1 ELSE 0 END) AS tickets_cerrados,
    SUM(CASE WHEN prioridad = 'Crítica' THEN 1 ELSE 0 END) AS tickets_criticos,
    SUM(CASE WHEN prioridad = 'Alta' THEN 1 ELSE 0 END) AS tickets_alta_prioridad,
    SUM(CASE WHEN origen = 'whatsapp' THEN 1 ELSE 0 END) AS tickets_whatsapp
FROM tickets;

-- =====================================================
-- ÍNDICES ADICIONALES PARA RENDIMIENTO
-- =====================================================

CREATE INDEX idx_tickets_estado ON tickets(estado_ticket);
CREATE INDEX idx_tickets_prioridad ON tickets(prioridad);
CREATE INDEX idx_tickets_fecha_creacion ON tickets(fecha_creacion);
CREATE INDEX idx_tickets_origen ON tickets(origen);
CREATE INDEX idx_mensajes_ticket_fecha ON mensajes(id_ticket, fecha_creacion);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DELIMITER $$

-- Procedimiento para crear ticket desde WhatsApp
CREATE PROCEDURE `crear_ticket_whatsapp`(
    IN p_whatsapp_numero VARCHAR(20),
    IN p_nombre_contacto VARCHAR(100),
    IN p_titulo VARCHAR(255),
    IN p_descripcion TEXT,
    IN p_conversation_id VARCHAR(100)
)
BEGIN
    DECLARE v_usuario_id INT DEFAULT NULL;
    DECLARE v_ticket_id INT;
    
    -- Buscar o crear usuario basado en número de WhatsApp
    SELECT usuario_id INTO v_usuario_id 
    FROM integracion_whatsapp 
    WHERE whatsapp_numero = p_whatsapp_numero;
    
    IF v_usuario_id IS NULL THEN
        -- Crear nuevo usuario
        INSERT INTO usuarios (nombre_completo, correo, nombre_usuario, contraseña, rol, whatsapp_numero)
        VALUES (p_nombre_contacto, CONCAT(REPLACE(p_whatsapp_numero, '+', ''), '@whatsapp.temp'), 
                CONCAT('wa_', REPLACE(p_whatsapp_numero, '+', '')), 'temp_password', 'usuario', p_whatsapp_numero);
        
        SET v_usuario_id = LAST_INSERT_ID();
        
        -- Crear registro de integración WhatsApp
        INSERT INTO integracion_whatsapp (usuario_id, whatsapp_numero, nombre_contacto, conversation_id)
        VALUES (v_usuario_id, p_whatsapp_numero, p_nombre_contacto, p_conversation_id);
    END IF;
    
    -- Crear ticket
    INSERT INTO tickets (titulo, descripcion, id_categoria1, id_usuario_reporta, origen, whatsapp_conversation_id)
    VALUES (p_titulo, p_descripcion, 5, v_usuario_id, 'whatsapp', p_conversation_id);
    
    SET v_ticket_id = LAST_INSERT_ID();
    
    -- Crear mensaje inicial
    INSERT INTO mensajes (id_ticket, remitente_id, remitente_tipo, remitente_nombre, texto, tipo_mensaje)
    VALUES (v_ticket_id, v_usuario_id, 'whatsapp', p_nombre_contacto, p_descripcion, 'whatsapp_in');
    
    SELECT v_ticket_id AS ticket_id;
END$$

DELIMITER ;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================
-- Este script crea una base de datos completa para el sistema Help Desk JCBD
-- con soporte para integración WhatsApp, gestión de usuarios, tickets y mensajes.
-- 
-- Características principales:
-- - Gestión completa de usuarios con roles
-- - Sistema de tickets con historial completo
-- - Integración nativa con WhatsApp
-- - Sistema de mensajes y comunicación
-- - Configuración flexible del sistema
-- - Vistas y procedimientos para facilitar consultas
-- - Índices optimizados para rendimiento
--
-- Para usar este script:
-- 1. Ejecutar en MySQL/MariaDB
-- 2. Configurar las credenciales en el backend
-- 3. Ajustar las configuraciones según necesidades

