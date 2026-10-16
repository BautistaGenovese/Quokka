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

TeamGallery recibe members con name, role, description, portrait opcional (ruta local o imagen configurada) y profileHref opcional. Sin portrait genera iniciales. Si se usa GitHub, distinguir el equipo asignado de los contribuidores calculados por commits.

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
