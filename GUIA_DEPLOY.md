# 🚀 Guía de Despliegue en la Nube (100% Gratuito)
**Proyecto:** Quokka — Portfolio Integrador  
**Materia:** Lenguajes IV  
**Responsable del Despliegue (Sprint 4):** Ignacio Giangrieco  

---

## 📌 1. Arquitectura de Despliegue Seleccionada

Para cumplir con los requerimientos de la cátedra manteniendo el costo en **$0 USD (sin necesidad de tarjetas de crédito ni suscripciones pagas)**, la arquitectura elegida se compone de:

```
[ Usuario / Navegador ]
         │
         ▼
[ FRONTEND en Vercel ] (Next.js 16 + React 19)
         │  (HTTPS / REST API)
         ▼
[ BACKEND en Render ] (Node.js + Express)
         │  (PostgreSQL Connection Pool con SSL)
         ▼
[ BASE DE DATOS en Neon.tech ] (PostgreSQL 15 Serverless)
```

---

## 🏆 2. ¿Por qué es la mejor opción? (Justificación Técnica)

### A. Frontend: Vercel
* **¿Por qué Vercel?** Vercel es la empresa creadora y mantenedora de Next.js. Es la plataforma con mejor optimización para Server-Side Rendering (SSR), Server Components y rutas estáticas.
* **100% Gratis:** Plan Hobby gratuito, permanente y sin requerir tarjeta.
* **Sin "hibernación" (Cold Start):** El frontend siempre responde al instante (a diferencia de plataformas que duermen las aplicaciones web completas).
* **Integración continua (CI/CD):** Cada `git push` a la rama principal despliega una nueva versión en producción automáticamente en menos de un minuto.

### B. Backend: Render (Web Service)
* **¿Por qué Render?** Está explícitamente sugerido y validado en la bitácora del proyecto de la cátedra (*"utilizando servicios como Vercel o Render"*).
* **100% Gratis:** Permite crear servicios web Node.js de forma gratuita y sin tarjeta.
* **HTTPS y Git automático:** Genera certificado SSL gratuito y se sincroniza con el repositorio de GitHub.
* **Consideración de la versión gratuita (*Spin-down*):** Tras 15 minutos de inactividad, el contenedor entra en modo suspensión (*sleep*). Cuando alguien entra después de un rato, la primera petición puede demorar ~30-50 segundos mientras el servidor levanta; luego funciona de manera rápida y normal.

### C. Base de Datos: Neon.tech (PostgreSQL Serverless)
* **¿Por qué NO la base de datos de Render?** El plan gratuito de PostgreSQL en Render **expira y se elimina automáticamente a los 30 días**. Si se utiliza para la entrega, la base de datos se borraría sola.
* **¿Por qué NO Railway?** Railway eliminó su capa gratuita permanente; actualmente solo ofrece créditos de prueba con expiración o requiere tarjeta.
* **Ventajas de Neon:**
  * Base de datos PostgreSQL real y moderna en la nube.
  * Plan gratuito permanente (hasta 0.5 GB de almacenamiento, más que suficiente para este proyecto).
  * Consola SQL web integrada para ejecutar scripts como `init.sql` con un solo clic.
  * No requiere ingresar tarjeta de crédito.

---

## 🛠️ 3. Paso a Paso para Realizar el Despliegue

### Paso 1: Configurar la Base de Datos en Neon.tech
1. Ingresar en [Neon.tech](https://neon.tech/) y registrarse (se puede iniciar sesión directamente con GitHub).
2. Crear un nuevo proyecto (ejemplo: `quokka-db`), seleccionando la versión PostgreSQL 15 o superior y la región más cercana (ej: `US East (Ohio)` o `South America` si está disponible).
3. En el panel principal del proyecto, copiar la cadena de conexión (**Connection String**).
   * Tendrá un formato similar a:
     `postgresql://quokka_user:clave_segura@ep-xyz-1234.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. En el menú lateral izquierdo de Neon, ir a **SQL Editor**.
5. Abrir el archivo local [`Quokka/database/init.sql`](file:///c:/Users/Ignacio/Yo/Proyecto-Leng4/Quokka/database/init.sql), copiar todo su contenido y pegarlo en el editor SQL de Neon.
6. Hacer clic en **Run** para crear todas las tablas, relaciones, roles y datos iniciales requeridos.

---

### Paso 2: Configurar y Desplegar el Backend en Render
1. Ingresar en [Render.com](https://render.com/) y registrarse con la cuenta de GitHub del proyecto.
2. Hacer clic en **New +** > **Web Service**.
3. Seleccionar el repositorio de GitHub de `Proyecto-Leng4`.
4. Completar los siguientes campos de configuración:
   * **Name:** `quokka-backend`
   * **Region:** Seleccionar la misma o más cercana a la base de Neon (ej: `Ohio (US East)`).
   * **Root Directory:** `Quokka/backend` *(¡Muy importante para que solo compile la carpeta del servidor!)*
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance Type:** `Free`
5. En la sección **Environment Variables** (Variables de Entorno), agregar:
   * `NODE_ENV`: `production`
   * `DATABASE_URL`: *(pegar la cadena de conexión obtenida de Neon)*
   * `JWT_SECRET`: *(clave secreta para los tokens, ej: una cadena alfanumérica larga)*
   * `JWT_EXPIRES_IN`: `7d`
   * `SMTP_HOST`: `smtp.gmail.com` (o dejar vacío para usar el fallback de pruebas Ethereal)
   * `SMTP_PORT`: `587`
   * `SMTP_SECURE`: `false`
   * `SMTP_USER`: *(correo emisor de notificaciones)*
   * `SMTP_PASS`: *(contraseña de aplicación de 16 letras de Google)*
   * `CONTACT_RECEIVER_EMAIL`: *(correo donde llegan los mensajes de contacto)*
   * `GOOGLE_CLIENT_ID`: *(el client ID de Google OAuth si se va a usar)*
6. Hacer clic en **Create Web Service**.
7. Una vez finalizado el build, Render proporcionará una URL pública con HTTPS (ejemplo: `https://quokka-backend.onrender.com`).
8. Probar en el navegador: `https://quokka-backend.onrender.com/api/status`. Si responde con estado `API funcionando correctamente 🚀` y `Base de Datos: Conectada ✅`, el backend ya está 100% operativo.

---

### Paso 3: Configurar y Desplegar el Frontend en Vercel
1. Ingresar en [Vercel.com](https://vercel.com/) e iniciar sesión con GitHub.
2. Hacer clic en **Add New...** > **Project**.
3. Importar el repositorio de `Proyecto-Leng4`.
4. En la configuración del proyecto:
   * **Framework Preset:** `Next.js` (se detecta automáticamente).
   * **Root Directory:** Hacer clic en *Edit* y seleccionar `Quokka/frontend`.
5. En la sección **Environment Variables**, agregar:
   * `NEXT_PUBLIC_API_URL`: `https://quokka-backend.onrender.com` *(la URL provista por Render en el Paso 2, sin barra final)*
   * `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: *(ID de Google OAuth)*
6. Hacer clic en **Deploy**.
7. Vercel compilará la aplicación y entregará una URL de producción (ejemplo: `https://quokka-frontend.vercel.app`).

---

## ⚠️ 4. Detalle Técnico Crucial en el Código del Backend

Neon (y casi cualquier PostgreSQL en la nube) exige conexiones encriptadas vía SSL.
En [`Quokka/backend/src/config/db.js`](file:///c:/Users/Ignacio/Yo/Proyecto-Leng4/Quokka/backend/src/config/db.js), la configuración del pool debe contemplar el parámetro SSL para producción:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ Base de Datos conectada con éxito.');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
```

---

## 🗺️ 5. Hoja de Ruta del Equipo (Sprint 4)

1. ⏳ **Paso A (Completado):** Mica finalizó las métricas y la integración de la API de GitHub (PR #6 mergeado a `main`).
2. 🔤 **Paso B (Siguiente):** Traducir los nombres de archivos que estén en inglés al español de forma consistente y limpia (actualizando rutas, imports en React/Next.js y tests para que nada se rompa).
3. 🧪 **Paso C:** Ejecutar la suite completa de tests (`npm test` tanto en backend como en frontend) y asegurar que el build de producción (`npm run build`) compile con código 0.
4. 🚀 **Paso D (Deploy):** Seguir esta guía para levantar Neon, Render y Vercel, y entregar las URLs funcionales a los docentes.
