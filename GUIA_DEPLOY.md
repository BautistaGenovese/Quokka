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
* **¿Por qué Vercel?** Creadores y mantenedores de Next.js; soporte nativo para Server Components, SSR y Turbopack.
* **100% Gratis:** Plan Hobby gratuito, permanente y sin requerir tarjeta.
* **Sin "hibernación" (Cold Start):** El frontend siempre responde al instante.
* **CI/CD Automático:** Cada `git push` a `main` despliega en producción en segundos.

### B. Backend: Render (Web Service)
* **¿Por qué Render?** Solicitado explícitamente en la bitácora del proyecto de la cátedra (*"utilizando servicios como Vercel o Render"*).
* **100% Gratis:** Despliegue de Node.js gratuito sin tarjeta de crédito.
* **HTTPS y Git automático:** Genera certificado SSL y se sincroniza con GitHub.
* **Comportamiento Free Tier (*Spin-down*):** Tras 15 minutos sin tráfico entra en suspensión; la primera petición demora unos segundos en despertar el contenedor.

### C. Base de Datos: Neon.tech (PostgreSQL Serverless)
* **¿Por qué NO la base de datos de Render?** El PostgreSQL gratuito de Render **expira y se elimina automáticamente a los 30 días**. Neon, en cambio, ofrece almacenamiento gratuito permanente (0.5 GB).
* **¿Por qué NO Railway?** Railway eliminó su capa gratuita permanente (requiere tarjeta o créditos con vencimiento).
* **Consola SQL Web:** Permite ejecutar `init.sql` directamente desde el navegador.

---

## 🔐 3. Consideraciones de Seguridad y Buenas Prácticas

Antes de desplegar en producción, se implementaron las siguientes medidas de seguridad:

1. **Contraseñas con Hashing (Bcrypt):**
   * Las contraseñas de los usuarios nunca se almacenan en texto plano. Se procesan con `bcrypt` (10 rondas de salt).
   * Al registrarse o loguearse, la API nunca expone el campo `password_hash` en las respuestas JSON.
2. **Tokens JWT Firmados:**
   * La sesión se maneja con JWT firmados criptográficamente mediante `JWT_SECRET`.
   * En producción, generar una clave aleatoria de al menos 32 caracteres ejecutando en la terminal:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
3. **CORS Restringido:**
   * El backend cuenta con la variable `FRONTEND_URL`. En producción solo aceptará peticiones provenientes del dominio de Vercel (ej. `https://quokka.vercel.app`) y de `localhost`.
4. **Cifrado de Base de Datos en Tránsito (SSL):**
   * [`backend/src/config/db.js`](file:///c:/Users/Ignacio/Yo/Proyecto-Leng4/Quokka/backend/src/config/db.js) detecta conexiones remotas y activa automáticamente `ssl: { rejectUnauthorized: false }`.
5. **Credenciales de Servicios Externos:**
   * **Nodemailer:** Utilizar una *Contraseña de Aplicación* de 16 caracteres de Google, **nunca** la contraseña personal de la cuenta. Si no se configuran, el backend activa el fallback transparente de pruebas (Ethereal).
   * **Gitignore:** Todos los archivos `.env` y `.env.local` están estrictamente ignorados en Git para no filtrar secretos.

---

## 👥 4. Usuarios Iniciales para Evaluación (Seed)

Para que los docentes o evaluadores puedan probar todos los módulos y paneles de inmediato, [`database/init.sql`](file:///c:/Users/Ignacio/Yo/Proyecto-Leng4/Quokka/database/init.sql) incluye dos usuarios predefinidos:

| Rol | Correo Electrónico | Contraseña | Acceso Permitido |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@quokka.com` | `Admin2026!Quokka` | Acceso total: CRUD Servicios, CRUD Proyectos, Gestión de Usuarios, Métricas y Gráficos. |
| **Operador** | `operador@quokka.com` | `Operador2026!Quokka` | Gestión y respuesta de solicitudes de contacto / cotización, visualización de usuarios. |

> [!TIP]
> **Promover una cuenta de Google a Administrador:**
> Si un integrante del equipo inicia sesión con Google en producción y quiere tener rol de Administrador, basta con ejecutar en la consola SQL de Neon:
> ```sql
> UPDATE usuarios SET rol = 'administrador' WHERE email = 'tu_correo@gmail.com';
> ```

---

## 🛠️ 5. Paso a Paso para el Despliegue

### Paso 1: Base de Datos en Neon.tech
1. Ingresar en [Neon.tech](https://neon.tech/) y registrarse con GitHub.
2. Crear un nuevo proyecto (ejemplo: `quokka-db`).
3. Copiar la cadena de conexión (**Connection String**), asegurando que termine con `?sslmode=require`.
4. Ir al **SQL Editor** en el panel lateral de Neon.
5. Copiar todo el contenido de [`Quokka/database/init.sql`](file:///c:/Users/Ignacio/Yo/Proyecto-Leng4/Quokka/database/init.sql), pegarlo y hacer clic en **Run**.

---

### Paso 2: Backend en Render
1. Ingresar en [Render.com](https://render.com/) e iniciar sesión con GitHub.
2. Clic en **New +** > **Web Service** y seleccionar el repositorio `Quokka`.
3. Configuración:
   * **Name:** `quokka-backend`
   * **Root Directory:** `Quokka/backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance Type:** `Free`
4. En **Environment Variables**:
   * `NODE_ENV`: `production`
   * `DATABASE_URL`: *(cadena copiada de Neon)*
   * `FRONTEND_URL`: `https://quokka.vercel.app` *(o el dominio final de Vercel)*
   * `JWT_SECRET`: *(cadena aleatoria segura)*
   * `JWT_EXPIRES_IN`: `7d`
   * `SMTP_HOST`: `smtp.gmail.com` *(opcional)*
   * `SMTP_PORT`: `587`
   * `SMTP_SECURE`: `false`
   * `SMTP_USER`: `tu_correo@gmail.com`
   * `SMTP_PASS`: `tu_contraseña_de_aplicacion_de_16_letras`
   * `CONTACT_RECEIVER_EMAIL`: `tu_correo@gmail.com`
   * `GOOGLE_CLIENT_ID`: `253181389432-tnihiib7pthai4fh8bln52pufaf1cnoh.apps.googleusercontent.com`
5. Clic en **Create Web Service**. Guardar la URL pública generada (ej: `https://quokka-backend.onrender.com`).
6. Comprobar en el navegador: `https://quokka-backend.onrender.com/api/status`.

---

### Paso 3: Frontend en Vercel
1. Ingresar en [Vercel.com](https://vercel.com/) e iniciar sesión con GitHub.
2. Clic en **Add New...** > **Project** e importar el repositorio `Quokka`.
3. Configuración del proyecto:
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Seleccionar `Quokka/frontend`
4. En **Environment Variables**:
   * `NEXT_PUBLIC_API_URL`: `https://quokka-backend.onrender.com` *(URL de Render sin barra final)*
   * `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: `253181389432-tnihiib7pthai4fh8bln52pufaf1cnoh.apps.googleusercontent.com`
5. Clic en **Deploy**.
6. Probar el frontend en producción, probar login con `admin@quokka.com` y verificar el panel de control.
