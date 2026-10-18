# Integración del frontend con el servidor

El frontend público está en /; el acceso preparado está en /iniciar-sesion. El equipo y las propuestas vienen de lib/site-content.js. No hay sesión simulada, registro ficticio, página de laboratorio ni shader de previews.

## Responsabilidades

El servidor debe resolver autenticación, permisos, consultas a GitHub, envío de contacto y caché. Las cards son presentación y no reciben tokens ni consultan endpoints. El contenido privado debe filtrarse antes de entregarlo al cliente: DemoCard locked no es un control de acceso.

## Contacto

ContactForm recibe onSubmitMessage, una función asíncrona con { name, email, type, message }. En la portada (`PortfolioPage`), el formulario se conecta mediante `submitContactRequest` (`lib/contact-api.js`) al endpoint `POST /api/contact` del backend, que valida y sanitiza en servidor, aplica límite de solicitudes por IP (rate limiting), persiste la consulta en PostgreSQL y envía la notificación por correo con Nodemailer. Sin adaptador, la UI únicamente valida y comunica que el envío no está habilitado.

El consumidor cliente puede importar ContactForm y suministrar su callback; no pasar funciones desde una página Server Component. El formulario administra carga y mensajes; el adaptador administra red y credenciales.

## Inicio de sesión

LoginForm recibe onSignIn({ email, password }). La capa de integración debe crear la sesión real, resolver errores, aplicar el método de transporte acordado y actualizar el contexto de usuario. El componente no persiste la contraseña ni la envía si falta el callback. La validación local exige un email válido y una contraseña no vacía; las reglas definitivas pertenecen al backend.

No hay endpoints inventados, autenticación conectada ni cookies de sesión creadas por esta entrega. AppearanceProvider contiene solo preferencias visuales, no identidad o permisos. El menú ya incluye un enlace funcional a /iniciar-sesion al pie del panel.

## Datos de presentación

### Panel y catálogo público

`lib/panel-api.js` centraliza lectura y escritura; `hooks/use-panel-resource.js` cancela lecturas anteriores al desmontar o recargar. `GET /api/servicios` y `GET /api/tecnologias` devuelven arreglos y son usados por el panel y la portada. Servicios incluyen `id`, `nombre_servicio`, `descripcion`, `tecnologias: [{ id, nombre }]`; tecnologías públicas incluyen `id`, `nombre`.

Los formularios envían POST/PUT a `/api/admin/servicios` y `/api/admin/tecnologias`, y DELETE al recurso con su id. El servicio siempre envía la selección completa en `tecnologia_ids`, incluido `[]`. El borrado requiere confirmación en diálogo e informa el efecto sobre asociaciones. Se aceptan respuestas DELETE con JSON o `204` sin cuerpo; los errores `400/409` se conservan sin cerrar el formulario. Después de una escritura se recargan los dos catálogos.

La bandeja solicita `GET /api/operador/contactos`, que puede devolver un arreglo o `{ contactos: [...] }`. Cada registro usa los campos de `mensajes_contacto`: `id`, `nombre`, `email`, `tipo`, `mensaje`, `estado`, `respuesta`, `creado_en`, `respondido_en`. La respuesta se envía a `POST /api/operador/contactos/:id/responder` con `{ respuesta }`. Ambos endpoints están implementados en el backend (`backend/src/controllers/contacto.controller.js` y `backend/src/routes/contacto.routes.js`): el frontend distingue `404` de una bandeja vacía y solo anuncia envío después de una respuesta HTTP exitosa. La validación de respuesta exige entre 10 y 5000 caracteres tanto en cliente como en servidor.

Los módulos viven en una sola AdminPage (`/panel`), con anclas `#servicios-admin`, `#tecnologias-admin` y `#consultas-admin`; no hay subrutas de administración. El selector de servicios agrega tecnologías desde Select y conserva los IDs en etiquetas removibles; no crea tecnologías desde texto libre. Las operaciones de correo reales no se ejecutan durante las verificaciones del panel. Autenticación y permisos no forman parte de este cambio. La integración de Juan se concentra en el acceso a AdminPage y el transporte en el adaptador, además de los controles de backend previstos en el contrato común.

TeamGallery recibe members con name, role, description, portrait opcional (ruta local o imagen configurada) y profileHref opcional. Sin portrait genera iniciales. En el Sprint 3, Micaías conectará la API de GitHub (`GET /api/github/miembros`) para obtener dinámicamente los perfiles de los integrantes (avatar, usuario, biografía y enlace de GitHub) y alimentar `TeamGallery` evitando que los datos queden hardcodeados. Distinguir el equipo asignado de los contribuidores calculados por commits si se usa la API de repositorios.

ProjectGallery usa las propuestas de site-content. Una integración futura puede adaptar repositorios a DemoCard o ProjectCard: title, description, preview, technologies, demoHref y codeHref según la variante. Omitir enlaces que no existan; no construir URLs de demos a partir de suposiciones. DemoPreview solo recibe src, alt y sizes; configurar hosts de next/image si se suministran imágenes remotas.

La API de repositorios no incluye automáticamente una captura de la aplicación. Acordar una previewUrl o archivo de portada, y cómo tratar descripciones nulas, estados de carga, listas vacías e imágenes fallidas.

## Límites entre módulos

- components/ui: primitivas y movimiento, sin dependencia de rutas ni fetch.
- components/cards: composiciones de presentación.
- components/forms: validación y puntos de integración asíncronos.
- components/portfolio: composición y adaptación de contenido.
- components/navigation: rutas, menú, paleta y transición.
- lib/site-content.js: datos locales sustituibles por una capa de carga.

Los estados de error/carga no deben producir un éxito ficticio ni ocultar información necesaria para recuperarse. Actualizar README y DESIGN cuando se conecten estas funciones o cambien sus contratos.
