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
-- 3. TABLA: servicios, tecnologias y su intermedia (servicios_tecnologias)
-- Responsable: Bautista Genovese (El más pro) (Sprint 3: CRUD de Servicios en Panel Admin)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  nombre_servicio VARCHAR(100) NOT NULL CHECK (char_length(btrim(nombre_servicio)) >= 3),
  descripcion TEXT NOT NULL CHECK (char_length(btrim(descripcion)) >= 10)
);

CREATE TABLE IF NOT EXISTS tecnologias (
  id SERIAL PRIMARY KEY,
  nombre_tecnologia VARCHAR(100) NOT NULL UNIQUE
    CHECK (char_length(btrim(nombre_tecnologia)) >= 1)
);

CREATE TABLE IF NOT EXISTS servicios_tecnologias (
  servicio_id INTEGER NOT NULL
    REFERENCES servicios(id) ON DELETE CASCADE,
  tecnologia_id INTEGER NOT NULL
    REFERENCES tecnologias(id) ON DELETE CASCADE,
  PRIMARY KEY (servicio_id, tecnologia_id)
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: mensajes_contacto
-- Responsable: Ignacio Giangrieco (Un re noob) (Sprint 2: Formulario y Endpoint de Contacto
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

-- Sección de la portada alcanzada (ej. 'equipo', 'contacto'). NULL cuando la visita es
-- a una página sin secciones (ej. /proyectos/:id). Solo modifica la tabla `visitas`;
-- ADD COLUMN IF NOT EXISTS lo hace compatible con volúmenes ya creados.
ALTER TABLE visitas ADD COLUMN IF NOT EXISTS seccion VARCHAR(50);

-- Índices para optimizar las consultas parametrizadas de métricas y listados
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas (fecha);
CREATE INDEX IF NOT EXISTS idx_visitas_usuario_id ON visitas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_contacto_estado ON mensajes_contacto (estado, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_proyectos_id_autor ON proyectos (id_autor);

-- -----------------------------------------------------------------------------
-- Datos iniciales: proyectos de muestra
-- Solo se insertan si la tabla está vacía, porque este script corre en cada
-- arranque del backend. Sin imagen (el frontend muestra la imagen por defecto)
-- y con el repositorio del equipo como enlace de demo.
-- -----------------------------------------------------------------------------
INSERT INTO proyectos (titulo, descripcion, tecnologias, url_demo)
SELECT muestra.titulo, muestra.descripcion, muestra.tecnologias, 'https://github.com/BautistaGenovese/Quokka'
FROM (VALUES
  (1, 'Gestor de Turnos & Agenda Web',
   'Propuesta de reserva horaria con prevención de solapamientos y panel de administración.',
   'Next.js, Express, PostgreSQL'),
  (2, 'Dashboard de Métricas & Tráfico',
   'Propuesta de panel con gráficos de visitas, tráfico público y usuarios autenticados.',
   'Next.js, Express, PostgreSQL'),
  (3, 'E-Commerce con API de Pagos',
   'Propuesta de catálogo, carrito y validación de stock con integración de pagos.',
   'Next.js, Express, PostgreSQL'),
  (4, 'Portal de Reservas Gastronómicas',
   'Propuesta de reservas con selección de comensales y validación de fechas.',
   'Next.js, Express, PostgreSQL')
) AS muestra (orden, titulo, descripcion, tecnologias)
WHERE NOT EXISTS (SELECT 1 FROM proyectos)
-- El listado ordena por id DESC ante la misma fecha: se insertan al revés
-- para que se muestren en el orden de arriba.
ORDER BY muestra.orden DESC;


-- -----------------------------------------------------------------------------
-- Imágenes de los proyectos de muestra (subidas a mano a Cloudinary).
-- Solo completa las que no tienen imagen (imagen_url IS NULL): sirve tanto para
-- bases nuevas como para las que ya tenían el seed sin imagen, y nunca pisa una
-- imagen cargada desde el CRUD. imagen_public_id queda en NULL (es opcional).
-- -----------------------------------------------------------------------------
UPDATE proyectos AS p
SET imagen_url = imagen.url
FROM (VALUES
  ('Gestor de Turnos & Agenda Web',
   'https://res.cloudinary.com/iujuazh5/image/upload/f_auto,q_auto/Inicio_Agenda_del_d%C3%ADa_1x'),
  ('Dashboard de Métricas & Tráfico',
   'https://res.cloudinary.com/iujuazh5/image/upload/v1792960215/Dashboard_de_M%C3%A9tricas_y_Tr%C3%A1fico_1x.png'),
  ('E-Commerce con API de Pagos',
   'https://res.cloudinary.com/iujuazh5/image/upload/v1792960463/E-Commerce_con_API_de_Pagos_1x.png'),
  ('Portal de Reservas Gastronómicas',
   'https://res.cloudinary.com/iujuazh5/image/upload/v1792960559/Portal_de_Reservas_Gastron%C3%B3micas.png')
) AS imagen (titulo, url)
WHERE p.titulo = imagen.titulo
  AND p.imagen_url IS NULL;
