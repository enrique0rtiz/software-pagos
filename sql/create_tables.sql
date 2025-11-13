-- Script SQL para crear las tablas necesarias en PostgreSQL
-- Este script es de referencia. La base de datos ya debe existir en Railway.
-- Ejecutar manualmente en la base de datos si es necesario.

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    motivo VARCHAR(500) NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    anio VARCHAR(10) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE,
    clase VARCHAR(100),
    profesor VARCHAR(255),
    horario VARCHAR(100),
    senal VARCHAR(100),
    pago_mensual BOOLEAN DEFAULT FALSE,
    pago_trimestral BOOLEAN DEFAULT FALSE,
    baja BOOLEAN DEFAULT FALSE,
    pago_metodo VARCHAR(50) CHECK (pago_metodo IN ('efectivo', 'tarjeta', 'transferencia')),
    ingresos_sep DECIMAL(10, 2),
    ingresos_oct DECIMAL(10, 2),
    ingresos_nov DECIMAL(10, 2),
    ingresos_ene DECIMAL(10, 2),
    ingresos_feb DECIMAL(10, 2),
    ingresos_mar DECIMAL(10, 2),
    ingresos_abr DECIMAL(10, 2),
    ingresos_may DECIMAL(10, 2),
    ingresos_jun DECIMAL(10, 2),
    recibo VARCHAR(100),
    numero_factura VARCHAR(100),
    referencia VARCHAR(100),
    contrato_inscripcion BOOLEAN DEFAULT FALSE,
    direccion VARCHAR(500),
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(20),
    provincia VARCHAR(100),
    telf1 VARCHAR(50),
    telf2 VARCHAR(50),
    nif VARCHAR(50),
    en_mailing BOOLEAN DEFAULT FALSE,
    email VARCHAR(255),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_nombre ON pagos(nombre, apellidos);
CREATE INDEX IF NOT EXISTS idx_clientes_anio ON clientes(anio);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(apellidos, nombre);

-- Comentarios en las tablas
COMMENT ON TABLE pagos IS 'Tabla para almacenar los pagos emitidos';
COMMENT ON TABLE clientes IS 'Tabla para almacenar los clientes organizados por temporadas';

