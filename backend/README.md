# 🚀 Guía de Inicio Rápido: Backend y Base de Datos (Proyecto Quokka)

Este documento explica paso a paso cómo poner en funcionamiento el servidor Backend y la Base de Datos PostgreSQL en cualquier computadora del equipo.

---

## 📋 Requisitos Previos

Antes de comenzar, cada integrante debe tener instalado en su computadora:
1. **[Node.js](https://nodejs.org/)** (versión 18 o superior recomendada).
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (debe estar abierto y corriendo).
3. **Git**.

---

## 🛠️ Paso a Paso para Levantar el Entorno

### 1. Iniciar la Base de Datos (PostgreSQL en Docker)

1. Abre una terminal y navega hasta la raíz del proyecto (`Quokka`):
   ```bash
   cd Quokka
   ```
2. Levanta el contenedor de la base de datos con Docker Compose:
   ```bash
   docker compose up -d
   ```
   > 💡 **Nota sobre el puerto:** Si en tu computadora ya tienes PostgreSQL instalado de antes, el puerto `5433` configurado en `docker-compose.yml` evitará conflictos con tu instalación previa. Si no tienes PostgreSQL instalado, funcionará directamente de la misma manera.

---

### 2. Configurar el Backend

1. Entra a la carpeta del backend:
   ```bash
   cd backend
   ```

2. **Instalar dependencias:** (Solo la primera vez o si se agregaron paquetes nuevos):
   ```bash
   npm install
   ```

3. **Variables de Entorno (`.env`):**
   Copia el archivo de ejemplo para crear tu propio `.env`:
   - En Windows (PowerShell):
     ```powershell
     cp .env.example .env
     ```
   - O simplemente duplica el archivo `.env.example` y renómbralo a `.env`.

   El archivo contendrá:
   ```env
   PORT=4000
   DATABASE_URL=postgresql://root:rootpassword@localhost:5433/portfolio_integrador
   ```

---

### 3. Iniciar el Servidor Backend

Dentro de la carpeta `backend`, ejecuta:

```bash
npm run dev
```

Verás un mensaje similar a este en la terminal:
```text
🚀 Servidor backend corriendo en http://localhost:4000
👉 Para probar el estado: http://localhost:4000/api/status
```

---

## ✅ ¿Cómo Verificar que Todo Funciona?

Abre tu navegador web y entra a:
👉 [http://localhost:4000/api/status](http://localhost:4000/api/status)

Deberías ver una respuesta JSON como esta:
```json
{
  "estado": "API funcionando correctamente 🚀",
  "base_de_datos": "Conectada ✅",
  "hora_servidor": "2026-10-08T..."
}
```

Si ves `"Conectada ✅"`, significa que:
- El servidor Express está activo.
- El contenedor de Docker está corriendo.
- La conexión entre Express y PostgreSQL fue exitosa.

---

## 🛑 ¿Cómo Detener los Servicios?

- **Detener el Backend:** Presiona `Ctrl + C` en la terminal donde está corriendo `npm run dev`.
- **Detener la Base de Datos (Docker):** En la carpeta `Quokka`, ejecuta:
  ```bash
  docker compose down
  ```
  *(Tus datos no se perderán gracias al volumen persistente configurado en Docker).*
