# Integración con backend y GitHub

Esta versión permite probar el portfolio en `/` (también `/experiencia`) y los
componentes en `/componentes`. Usa contenido local en `lib/site-content.js`.
El botón de registro del portfolio simula una sesión; los accesos del menú son
plantillas y el formulario sin callback valida sin enviar datos.

## Separación de responsabilidades

El backend consulta GitHub y resuelve autenticación, permisos y caché. La página
recibe sus datos y los adapta a las props de los componentes. Las cards no deben
consultar endpoints ni recibir tokens de GitHub.

## Formato propuesto para acordar entre módulos

Estos nombres son una propuesta, no endpoints implementados ni un contrato ya
confirmado con el backend:

```js
// Integrante: rol y descripción del proyecto pueden diferir de su bio pública.
{
  id: "identificador-estable",
  username: "usuario-github",
  name: "Nombre visible",
  role: "Responsabilidad en Quokka",
  description: "Presentación del integrante",
  avatarUrl: null,
  profileUrl: "https://github.com/usuario-github"
}

// Proyecto autorizado para la persona que realiza la consulta.
{
  id: "identificador-estable",
  name: "Nombre del repositorio",
  description: "Descripción del proyecto",
  languages: ["JavaScript", "CSS"],
  members: [], // Integrantes con el formato anterior.
  repositoryUrl: null,
  demoUrl: null,
  previewUrl: null
}

// Sesión: null significa visitante; no reemplazarla por la simulación local.
{ user: null }
// Con sesión: { user: { id, name, avatarUrl } }
```

## Adaptación a los componentes actuales

- `TeamCard`: name, role, description y profileHref. La foto se pasa como JSX
  mediante portrait; sin foto muestra iniciales. Normalizar name con username
  si GitHub no devuelve nombre. No pasar directamente respuestas sin validar.
- `ProjectCard`: name → title, languages → technologies, repositoryUrl → codeHref,
  demoUrl → demoHref; preview acepta JSX. Todavía falta la vista de participantes.
- `DemoCard`: name → title, description, demoHref y preview. Su diseño mínimo
  no muestra lenguajes ni participantes. locked omite el contenido protegido.
- `DemoPreview`: recibe src y alt. Las imágenes remotas requieren configurar
  los hosts permitidos en Next; comprobar CORS para el shader y disponer de
  una alternativa cuando la imagen o WebGL no estén disponibles.

## Decisiones pendientes antes de conectar

- Definir si members representa el equipo asignado o los contribuidores de
  GitHub: los contribuidores se calculan a partir de commits y no equivalen
  necesariamente al equipo completo.
- Acordar una ruta de imagen de portada dentro de cada repo o una previewUrl
  mantenida por el backend. La metadata del repositorio no incluye una captura
  automática de la aplicación.
- Resolver carga, errores, listas vacías, descripciones nulas y fotos fallidas
  en la capa que obtiene los datos, conservando las cards como presentación.
- Construir la presentación del usuario autenticado en el menú usando la sesión
  real. La foto de GitHub requiere identificar o vincular esa cuenta.
- El backend debe impedir la entrega de datos protegidos a visitantes. locked
  es una presentación visual, no un control de acceso ni un mecanismo de seguridad.

Se puede compartir esta rama y desarrollar los módulos en paralelo; este
documento registra lo preparado y lo pendiente sin simular una integración real.
