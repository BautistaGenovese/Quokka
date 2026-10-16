-- =============================================================================
-- PROYECTO QUOKKA - ESQUEMA UNIFICADO DE BASE DE DATOS (PostgreSQL 15)
-- Materia: Lenguajes IV
-- Convención: Nombres de tablas y columnas íntegramente en español (snake_case)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLA: usuarios
-- Responsable: Juan Girón (Sprint 2: Login/Registro | Sprint 3: Panel Admin)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL CHECK (char_length(btrim(nombre)) >= 2),
  email VARCHAR(255) NOT NULL UNIQUE CHECK (char_length(btrim(email)) >= 5),
  password_hash VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario'
    CHECK (rol IN ('usuario', 'operador', 'administrador')),
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. TABLA: proyectos
-- Responsables: Lautaro Jándula (Sprint 2 y 3: Vistas y CRUD Proyectos)
--               Micaías Villa (Integración con Cloudinary para imágenes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proyectos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL CHECK (char_length(btrim(titulo)) >= 3),
  descripcion TEXT,
  tecnologias VARCHAR(255),
  url_demo VARCHAR(255),
  imagen_url TEXT,
  imagen_public_id VARCHAR(255),
  id_autor INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_publicacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. TABLA: servicios
-- Responsable: Bautista Genovese (Sprint 3: CRUD de Servicios en Panel Admin)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  nombre_servicio VARCHAR(100) NOT NULL CHECK (char_length(btrim(nombre_servicio)) >= 3),
  descripcion TEXT NOT NULL CHECK (char_length(btrim(descripcion)) >= 10)
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: mensajes_contacto
-- Responsable: Ignacio Giangrieco (Sprint 2: Formulario y Endpoint de Contacto
--                                  Sprint 3: Panel del Operador y Respuestas)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL CHECK (char_length(btrim(nombre)) >= 2),
  email VARCHAR(255) NOT NULL CHECK (char_length(btrim(email)) >= 5),
  tipo VARCHAR(20) NOT NULL
    CHECK (tipo IN ('cotizacion', 'asesoria', 'general', 'consulta')),
  mensaje TEXT NOT NULL CHECK (char_length(btrim(mensaje)) BETWEEN 10 AND 5000),
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'respondido')),
  respuesta TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  respondido_en TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: visitas
-- Responsable: Micaías Villa (Sprint 4: Contadores y Gráficos de Métricas)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitas (
  id SERIAL PRIMARY KEY,
  ruta VARCHAR(255) NOT NULL CHECK (char_length(btrim(ruta)) >= 1),
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar las consultas parametrizadas de métricas y listados
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas (fecha);
CREATE INDEX IF NOT EXISTS idx_visitas_usuario_id ON visitas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_contacto_estado ON mensajes_contacto (estado, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_proyectos_id_autor ON proyectos (id_autor);
