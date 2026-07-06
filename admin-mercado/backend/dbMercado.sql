CREATE DATABASE IF NOT EXISTS DB_MERC;
USE DB_MERC;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    correo         VARCHAR(100) NOT NULL UNIQUE,
    password       VARCHAR(50) NOT NULL,
    rol            ENUM('administrador', 'locatario') NOT NULL,
    telefono       VARCHAR(20),
    activo         TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS puestos (
    id_puesto      INT AUTO_INCREMENT PRIMARY KEY,
    numero_puesto  VARCHAR(20) NOT NULL UNIQUE,
    estado         ENUM('disponible', 'asignado') DEFAULT 'disponible',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS locatarios (
    id_locatario       INT PRIMARY KEY,
    giro_comercial     VARCHAR(100) NOT NULL,
    id_puesto_asignado INT UNIQUE NULL,
    FOREIGN KEY (id_locatario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_puesto_asignado) REFERENCES puestos(id_puesto) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pagos (
    id_pago         INT AUTO_INCREMENT PRIMARY KEY,
    id_locatario    INT NOT NULL,
    id_puesto       INT NOT NULL,
    mes_pagado      TINYINT NOT NULL,
    anio_pagado     INT NOT NULL,
    monto           DECIMAL(10,2) NOT NULL,
    fecha_pago      TIMESTAMP NULL DEFAULT NULL,
    estado_pago     ENUM('pendiente', 'pagado', 'vencido') DEFAULT 'pendiente',
    fecha_limite DATE NULL,
    comprobante_url VARCHAR(255) NULL,
    UNIQUE KEY uq_pago_mes (id_locatario, mes_pagado, anio_pagado),
    FOREIGN KEY (id_locatario) REFERENCES locatarios(id_locatario) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_puesto) REFERENCES puestos(id_puesto) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS incidencias (
    id_incidencia   INT AUTO_INCREMENT PRIMARY KEY,
    id_locatario    INT NOT NULL,
    titulo          VARCHAR(100) NOT NULL,
    descripcion     TEXT NOT NULL,
    estado          ENUM('Abierta', 'En proceso', 'Resuelta') DEFAULT 'Abierta',
    respuesta_admin TEXT NULL,
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (id_locatario) REFERENCES locatarios(id_locatario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS avisos (
    id_aviso          INT AUTO_INCREMENT PRIMARY KEY,
    id_administrador  INT NOT NULL,
    titulo            VARCHAR(150) NOT NULL,
    contenido         TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vigencia    DATE NOT NULL,
    archivado         TINYINT(1) DEFAULT 0,
    FOREIGN KEY (id_administrador) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


INSERT INTO usuarios (nombre, correo, password, rol, telefono) VALUES
('Carlos Mendoza', 'carlos@mercado.com', 'admin123', 'administrador', '7712345678'),
('Ana López', 'ana@mercado.com', 'ana123', 'locatario', '7719876543'),
('Pedro Ramírez', 'pedro@mercado.com', 'pedro123', 'locatario', '7713456789'),
('Lucía Torres', 'lucia@mercado.com', 'lucia123', 'locatario', '7714567890'),
('Mario Sánchez', 'mario@mercado.com', 'mario123', 'locatario', '7715678901');

INSERT INTO puestos (numero_puesto, estado) VALUES
('A-01', 'asignado'),
('A-02', 'asignado'),
('A-03', 'asignado'),
('B-01', 'disponible'),
('B-02', 'disponible');

INSERT INTO locatarios (id_locatario, giro_comercial, id_puesto_asignado) VALUES
(2, 'Verduras y Frutas', 1),
(3, 'Carnicería', 2),
(4, 'Ropa y Accesorios', 3),
(5, 'Tortillería', NULL);

INSERT INTO pagos (id_locatario, id_puesto, mes_pagado, anio_pagado, monto, fecha_pago, estado_pago, fecha_limite) VALUES
(2, 1, 2, 2026, 800.00, '2026-02-03 10:00:00', 'pagado', '2026-03-06'),
(2, 1, 3, 2026, 800.00, '2026-03-02 09:30:00', 'pagado', '2026-04-06'),
(2, 1, 4, 2026, 800.00, NULL, 'pendiente', '2026-05-06'),
(3, 2, 3, 2026, 950.00, '2026-03-04 11:00:00', 'pagado', '2026-04-06'),
(3, 2, 2, 2026, 950.00, NULL, 'vencido', '2026-03-06'),
(3, 2, 4, 2026, 950.00, NULL, 'vencido', '2026-05-06'),
(4, 3, 3, 2026, 700.00, '2026-03-01 08:00:00', 'pagado', '2026-04-06'),
(4, 3, 5, 2026, 700.00, NULL, 'pendiente', '2026-06-06');

INSERT INTO incidencias (id_locatario, titulo, descripcion, estado, respuesta_admin, fecha_respuesta) VALUES
(2, 'Fuga de agua', 'Hay una fuga en la tubería cerca de mi puesto A-01', 'Resuelta', 'Se envió al técnico y fue reparada el mismo día', '2025-05-10 14:00:00'),
(3, 'Conflicto con vecino', 'El locatario de A-01 invade mi espacio con su mercancía', 'En proceso', NULL, NULL),
(4, 'Luz fundida', 'El foco del pasillo B está fundido desde hace 3 días', 'Abierta', NULL, NULL);

INSERT INTO avisos (id_administrador, titulo, contenido, fecha_vigencia) VALUES
(1, 'Mantenimiento eléctrico', 'El día 15 de julio se realizará mantenimiento eléctrico general. No habrá luz de 8am a 12pm.', '2025-07-15'),
(1, 'Incremento de renta', 'A partir de agosto la renta tendrá un incremento del 5%. Cualquier duda comunicarse con administración.', '2025-07-31'),
(1, 'Reunión de locatarios', 'Se convoca a todos los locatarios a reunión el 30 de junio a las 6pm en el patio central.', '2025-06-30');




--  PROCEDIMIENTOS

-- LISTAR
DELIMITER //
CREATE PROCEDURE sp_listar_locatarios()
BEGIN
    SELECT
        u.id_usuario,
        u.nombre,
        u.correo,
        u.telefono,
        u.activo,
        l.giro_comercial,
        p.numero_puesto
    FROM usuarios u
    INNER JOIN locatarios l ON u.id_usuario = l.id_locatario
    LEFT JOIN puestos p ON l.id_puesto_asignado = p.id_puesto
    WHERE u.rol = 'locatario';
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_listar_admins_activos()
BEGIN
    SELECT
        id_usuario,
        nombre,
        correo,
        telefono,
        fecha_creacion
    FROM usuarios
    WHERE rol = 'administrador' AND activo = 1;
END //
DELIMITER ;

-- =====================================================
-- LOCATARIOS
-- =====================================================

DELIMITER //
CREATE PROCEDURE sp_registrar_locatario(
    IN p_nombre        VARCHAR(100),
    IN p_correo        VARCHAR(100),
    IN p_password      VARCHAR(50),
    IN p_telefono      VARCHAR(20),
    IN p_giro_comercial VARCHAR(100)
)
BEGIN
    DECLARE v_id INT;
    INSERT INTO usuarios (nombre, correo, password, rol, telefono)
    VALUES (p_nombre, p_correo, p_password, 'locatario', p_telefono);
    SET v_id = LAST_INSERT_ID();
    INSERT INTO locatarios (id_locatario, giro_comercial)
    VALUES (v_id, p_giro_comercial);
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_asignar_puesto(
    IN p_id_locatario INT,
    IN p_id_puesto    INT
)
BEGIN
    DECLARE v_estado VARCHAR(20);
    SELECT estado INTO v_estado FROM puestos WHERE id_puesto = p_id_puesto;
    IF v_estado != 'disponible' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El puesto no está disponible';
    ELSE
		UPDATE locatarios SET id_puesto_asignado = NULL WHERE id_locatario=p_id_locatario;
        UPDATE locatarios SET id_puesto_asignado = p_id_puesto WHERE id_locatario = p_id_locatario;
        UPDATE puestos SET estado = 'asignado' WHERE id_puesto = p_id_puesto;
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_dar_baja_locatario(
    IN p_id_locatario INT
)
BEGIN
    UPDATE usuarios SET activo = 0 WHERE id_usuario = p_id_locatario;
    UPDATE locatarios SET id_puesto_asignado = NULL WHERE id_locatario = p_id_locatario;
END //
DELIMITER ;

-- =====================================================
-- PAGOS
-- =====================================================

DELIMITER //
CREATE PROCEDURE sp_registrar_pago(
    IN p_id_locatario INT,
    IN p_id_puesto    INT,
    IN p_mes          TINYINT,
    IN p_anio         INT,
    IN p_monto        DECIMAL(10,2)
)
BEGIN
    INSERT INTO pagos (id_locatario, id_puesto, mes_pagado, anio_pagado, monto, estado_pago)
    VALUES (p_id_locatario, p_id_puesto, p_mes, p_anio, p_monto, 'pendiente');
END //
DELIMITER ;

DELIMITER //
DELIMITER //

CREATE PROCEDURE sp_marcar_pago(
    IN p_id_pago INT
)
BEGIN
    UPDATE pagos
    SET estado_pago = 'pagado',
        fecha_pago = NOW()
    WHERE id_pago = p_id_pago;
END //

DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_verificar_morosidad(
    IN p_id_locatario INT
)
BEGIN
    DECLARE v_meses_vencidos INT;
    SELECT COUNT(*) INTO v_meses_vencidos
    FROM pagos
    WHERE id_locatario = p_id_locatario AND estado_pago = 'vencido';
    IF v_meses_vencidos >= 2 THEN
        UPDATE usuarios SET activo = 0 WHERE id_usuario = p_id_locatario;
        SELECT 'Locatario bloqueado por morosidad' AS mensaje;
    ELSE
        SELECT CONCAT(v_meses_vencidos, ' mes(es) vencido(s), sin bloqueo') AS mensaje;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- INCIDENCIAS
-- =====================================================

DELIMITER //
CREATE PROCEDURE sp_abrir_incidencia(
    IN p_id_locatario INT,
    IN p_titulo       VARCHAR(100),
    IN p_descripcion  TEXT
)
BEGIN
    INSERT INTO incidencias (id_locatario, titulo, descripcion)
    VALUES (p_id_locatario, p_titulo, p_descripcion);
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_responder_incidencia(
    IN p_id_incidencia  INT,
    IN p_respuesta      TEXT
)
BEGIN
    UPDATE incidencias
    SET estado = 'En proceso',
        respuesta_admin = p_respuesta,
        fecha_respuesta = CURRENT_TIMESTAMP
    WHERE id_incidencia = p_id_incidencia;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_cerrar_incidencia(
    IN p_id_incidencia INT
)
BEGIN
    UPDATE incidencias
    SET estado = 'Resuelta'
    WHERE id_incidencia = p_id_incidencia;
END //
DELIMITER ;

-- =====================================================
-- AVISOS
-- =====================================================

DELIMITER //
CREATE PROCEDURE sp_publicar_aviso(
    IN p_id_administrador INT,
    IN p_titulo           VARCHAR(150),
    IN p_contenido        TEXT,
    IN p_fecha_vigencia   DATE
)
BEGIN
    INSERT INTO avisos (id_administrador, titulo, contenido, fecha_vigencia)
    VALUES (p_id_administrador, p_titulo, p_contenido, p_fecha_vigencia);
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_archivar_avisos_vencidos()
BEGIN
    UPDATE avisos
    SET archivado = 1
    WHERE fecha_vigencia < CURDATE() AND archivado = 0;
END //
DELIMITER ;

-- =====================================================
-- REPORTES
-- =====================================================

DELIMITER //
CREATE PROCEDURE sp_reporte_pagos(
    IN p_mes  TINYINT,
    IN p_anio INT
)
BEGIN
    SELECT
        COUNT(*) AS total_pagos,
        SUM(CASE WHEN estado_pago = 'pagado'   THEN monto ELSE 0 END) AS total_cobrado,
        SUM(CASE WHEN estado_pago = 'pendiente' THEN 1 ELSE 0 END)    AS pagos_pendientes,
        SUM(CASE WHEN estado_pago = 'vencido'   THEN 1 ELSE 0 END)    AS pagos_vencidos
    FROM pagos
    WHERE mes_pagado = p_mes AND anio_pagado = p_anio;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_reporte_ocupacion()
BEGIN
    SELECT
        COUNT(*) AS total_puestos,
        SUM(CASE WHEN estado = 'asignado'    THEN 1 ELSE 0 END) AS puestos_asignados,
        SUM(CASE WHEN estado = 'disponible'  THEN 1 ELSE 0 END) AS puestos_disponibles
    FROM puestos;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_reporte_incidencias()
BEGIN
    SELECT
        COUNT(*) AS total_incidencias,
        SUM(CASE WHEN estado = 'Abierta'     THEN 1 ELSE 0 END) AS abiertas,
        SUM(CASE WHEN estado = 'En proceso'  THEN 1 ELSE 0 END) AS en_proceso,
        SUM(CASE WHEN estado = 'Resuelta'    THEN 1 ELSE 0 END) AS resueltas
    FROM incidencias;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_listar_puestos()
BEGIN
    SELECT p.id_puesto, p.numero_puesto, p.estado, u.nombre, l.giro_comercial, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), '%d/%m/%Y') AS vence,
        ( SELECT estado_pago
			FROM pagos pa
            WHERE pa.id_puesto = p.id_puesto
            ORDER BY anio_pagado DESC,
                     mes_pagado DESC
            LIMIT 1
        ) AS estado_pago,

        (
			SELECT DATE_FORMAT(MAX(fecha_pago), '%d/%m/%Y')
			FROM pagos pa
			WHERE pa.id_puesto = p.id_puesto
			  AND pa.estado_pago = 'pagado'
			  AND p.estado = 'asignado'
		) AS ultimo_pago
        
    FROM puestos p

    LEFT JOIN locatarios l
        ON p.id_puesto = l.id_puesto_asignado

    LEFT JOIN usuarios u
        ON l.id_locatario = u.id_usuario

    ORDER BY p.numero_puesto;

END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE sp_liberar_puesto(
    IN p_id_puesto INT
)
BEGIN
    UPDATE locatarios
    SET id_puesto_asignado = NULL
    WHERE id_puesto_asignado = p_id_puesto;

    UPDATE puestos
    SET estado = 'disponible'
    WHERE id_puesto = p_id_puesto;

END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_locatarios_sin_puesto()
BEGIN
    SELECT u.id_usuario, u.nombre, l.giro_comercial
    FROM usuarios u

    INNER JOIN locatarios l
        ON u.id_usuario = l.id_locatario

    WHERE l.id_puesto_asignado IS NULL
      AND u.activo = 1

    ORDER BY u.nombre;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_generar_pagos_mes(
    IN p_mes  INT,
    IN p_anio INT
)
BEGIN
    INSERT IGNORE INTO pagos (id_locatario, id_puesto, mes_pagado, anio_pagado, monto, estado_pago, fecha_limite)
    SELECT
        l.id_locatario,
        l.id_puesto_asignado,
        p_mes,
        p_anio,
        800.00,
        'pendiente',
        DATE_ADD(LAST_DAY(CONCAT(p_anio, '-', p_mes, '-01')), INTERVAL 5 DAY)
    FROM locatarios l
    WHERE l.id_puesto_asignado IS NOT NULL;
END //
DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_actualizar_vencidos()
BEGIN
    UPDATE pagos
    SET estado_pago = 'vencido'
    WHERE estado_pago = 'pendiente'
      AND CURDATE() > fecha_limite;
END //

DELIMITER ;


DELIMITER //
CREATE PROCEDURE sp_listar_pagos_todos()
BEGIN
    SELECT
        p.id_puesto,
        p.numero_puesto,
        u.nombre,
        l.giro_comercial,
        pa.id_pago,
        pa.mes_pagado,
        pa.anio_pagado,
        DATE_FORMAT(pa.fecha_limite, '%d/%m/%Y') AS vence,
        pa.estado_pago,
        DATE_FORMAT(pa.fecha_pago, '%d/%m/%Y') AS ultimo_pago
    FROM pagos pa
    INNER JOIN puestos p ON pa.id_puesto = p.id_puesto
    LEFT JOIN locatarios l ON p.id_puesto = l.id_puesto_asignado
    LEFT JOIN usuarios  u ON l.id_locatario = u.id_usuario
    ORDER BY pa.anio_pagado DESC, pa.mes_pagado DESC, p.numero_puesto;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_listar_puestos_mes(
    IN p_mes  INT,
    IN p_anio INT
)
BEGIN
    SELECT
        p.id_puesto,
        p.numero_puesto,
        p.estado,
        u.nombre,
        l.giro_comercial,
        pa.id_pago,
        DATE_FORMAT(pa.fecha_limite, '%d/%m/%Y') AS vence,
        pa.estado_pago,
        DATE_FORMAT(pa.fecha_pago, '%d/%m/%Y') AS ultimo_pago
    FROM pagos pa
    INNER JOIN puestos p ON pa.id_puesto = p.id_puesto
    LEFT JOIN locatarios l ON p.id_puesto = l.id_puesto_asignado
    LEFT JOIN usuarios  u  ON l.id_locatario = u.id_usuario
    WHERE pa.mes_pagado = p_mes
      AND pa.anio_pagado = p_anio
      AND p.estado = 'asignado'
    ORDER BY p.numero_puesto;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_registrar_pago_puesto(
    IN p_id_puesto  INT,
    IN p_mes        INT,
    IN p_anio       INT,
    IN p_fecha_pago DATETIME
)
BEGIN
    DECLARE v_id_locatario INT;
    DECLARE v_id_pago      INT;
 
    SELECT id_locatario INTO v_id_locatario
    FROM locatarios
    WHERE id_puesto_asignado = p_id_puesto
    LIMIT 1;
 
    IF v_id_locatario IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El puesto no tiene locatario asignado';
    END IF;
 
    SELECT id_pago INTO v_id_pago
    FROM pagos
    WHERE id_puesto = p_id_puesto
      AND mes_pagado = p_mes
      AND anio_pagado = p_anio
    LIMIT 1;
 
    IF v_id_pago IS NULL THEN
        INSERT INTO pagos (id_locatario, id_puesto, mes_pagado, anio_pagado, monto, fecha_pago, estado_pago)
        VALUES (v_id_locatario, p_id_puesto, p_mes, p_anio, 800.00, IFNULL(p_fecha_pago, NOW()), 'pagado');
    ELSE
        UPDATE pagos
        SET estado_pago = 'pagado',
            fecha_pago  = IFNULL(p_fecha_pago, NOW())
        WHERE id_pago = v_id_pago;
    END IF;
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE sp_listar_incidencias()
BEGIN
    SELECT
        i.id_incidencia,
        i.titulo,
        i.descripcion,
        i.estado,
        i.respuesta_admin,
        DATE_FORMAT(i.fecha_creacion, '%d/%m/%Y')      AS fecha_creacion,
        DATE_FORMAT(i.fecha_creacion, '%h:%i %p')       AS hora_creacion,
        DATE_FORMAT(i.fecha_respuesta, '%d/%m/%Y %h:%i %p') AS fecha_respuesta,
        u.nombre,
        p.numero_puesto,
        l.giro_comercial
    FROM incidencias i
    INNER JOIN locatarios l ON i.id_locatario = l.id_locatario
    INNER JOIN usuarios  u ON l.id_locatario  = u.id_usuario
    LEFT JOIN puestos p ON l.id_puesto_asignado = p.id_puesto
    ORDER BY i.fecha_creacion DESC;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_incidencias_abiertas()
BEGIN
    SELECT
        i.id_incidencia,
        i.titulo,
        u.nombre,
        p.numero_puesto,
        DATE_FORMAT(i.fecha_creacion, '%d/%m/%Y') AS fecha
    FROM incidencias i
    INNER JOIN locatarios l ON i.id_locatario = l.id_locatario
    INNER JOIN usuarios  u ON l.id_locatario  = u.id_usuario
    LEFT JOIN puestos p ON l.id_puesto_asignado = p.id_puesto
    WHERE i.estado = 'Abierta'
    ORDER BY i.fecha_creacion DESC;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_locatarios_para_incidencia()
BEGIN
    SELECT u.id_usuario AS id_locatario, u.nombre, p.numero_puesto
    FROM usuarios u
    INNER JOIN locatarios l ON u.id_usuario = l.id_locatario
    LEFT JOIN puestos p ON l.id_puesto_asignado = p.id_puesto
    WHERE u.rol = 'locatario' AND u.activo = 1
    ORDER BY u.nombre;
END //
DELIMITER 

DELIMITER //
CREATE PROCEDURE sp_listar_avisos()
BEGIN
    SELECT
        id_aviso,
        titulo,
        contenido,
        DATE_FORMAT(fecha_publicacion, '%d/%m/%Y') AS fecha_publicacion,
        DATE_FORMAT(fecha_vigencia, '%d/%m/%Y')    AS fecha_vigencia,
        archivado
    FROM avisos
    WHERE archivado = 0
    ORDER BY fecha_publicacion DESC;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_editar_aviso(
    IN p_id_aviso       INT,
    IN p_titulo         VARCHAR(150),
    IN p_contenido      TEXT,
    IN p_fecha_vigencia DATE
)
BEGIN
    UPDATE avisos
    SET titulo = p_titulo,
        contenido = p_contenido,
        fecha_vigencia = p_fecha_vigencia
    WHERE id_aviso = p_id_aviso;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_eliminar_aviso(IN p_id_aviso INT)
BEGIN
    UPDATE avisos SET archivado = 1 WHERE id_aviso = p_id_aviso;
END //
DELIMITER ;

-- ADMINISTRADORES
DELIMITER //
CREATE PROCEDURE sp_listar_administradores()
BEGIN
    SELECT
        id_usuario,
        nombre,
        correo,
        telefono,
        activo,
        DATE_FORMAT(fecha_creacion, '%d/%m/%Y') AS fecha_creacion
    FROM usuarios
    WHERE rol = 'administrador'
    ORDER BY nombre;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_registrar_administrador(
    IN p_nombre   VARCHAR(100),
    IN p_correo   VARCHAR(100),
    IN p_password VARCHAR(50),
    IN p_telefono VARCHAR(20)
)
BEGIN
    INSERT INTO usuarios (nombre, correo, password, rol, telefono)
    VALUES (p_nombre, p_correo, p_password, 'administrador', p_telefono);
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_cambiar_estado_administrador(
    IN p_id_usuario   INT,
    IN p_nuevo_estado TINYINT
)
BEGIN
    DECLARE v_activos INT;
 
    IF p_nuevo_estado = 0 THEN
        SELECT COUNT(*) INTO v_activos
        FROM usuarios
        WHERE rol = 'administrador' AND activo = 1;
 
        IF v_activos <= 1 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No puedes desactivar al único administrador activo';
        END IF;
    END IF;
 
    UPDATE usuarios SET activo = p_nuevo_estado WHERE id_usuario = p_id_usuario;
END //
DELIMITER ;