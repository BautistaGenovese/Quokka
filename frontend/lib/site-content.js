// Contenido del portfolio separado del layout. Integrantes y responsabilidades
// tomados de Bitacora de Leng IV.pdf (Sprint 2); no son perfiles ficticios.
export const TEAM = [
  { name: "Bautista Genovese", role: "Componentes reutilizables y UX/UI", description: "Maquetación de botones, formularios, tarjetas y carruseles, con adaptación a computadoras y celulares.", profileHref: "https://github.com/BautistaGenovese" },
  { name: "Juan Girón", role: "Autenticación y gestión de usuarios", description: "Registro e inicio de sesión, validación de campos y control de acceso según los roles de la plataforma.", profileHref: "https://github.com/juangiron06" },
  { name: "Lautaro Jándula", role: "Proyectos y demos", description: "Interfaz de proyectos, acceso condicionado a la sesión y gestión de contenido de las demos.", profileHref: "https://github.com/codebylauti" },
  { name: "Ignacio Giangrieco", role: "Backend y contacto", description: "Arquitectura del servidor, conexión con la base de datos y recepción de consultas y solicitudes.", profileHref: "https://github.com/xl5net" },
  { name: "Micaías Villa", role: "Animaciones e integraciones", description: "Transiciones de página, animaciones de componentes e integración de APIs externas.", profileHref: "https://github.com/micaias05" },
];
export const SITE_LINKS = [
  { href: "#inicio", label: "Inicio" }, { href: "#manifiesto", label: "Filosofía" },
  { href: "#equipo", label: "Equipo" }, { href: "#servicios", label: "Servicios" },
  { href: "#proyectos", label: "Proyectos y demos" }, { href: "#stack-tech", label: "Tecnologías" },
  { href: "#contacto", label: "Contacto" },
];
export const SERVICES = [
  { title: "Desarrollo Web Fullstack", description: "Interfaces adaptables, componentes reutilizables y un backend modular para aplicaciones web.", tags: ["React", "Node.js", "Responsive"] },
  { title: "APIs y bases de datos", description: "Endpoints REST, modelado de datos y validación de solicitudes para conectar las distintas partes del sistema.", tags: ["Express", "PostgreSQL", "REST"] },
  { title: "Motion Design", description: "Transiciones y microinteracciones que acompañan la navegación, respetando teclado y movimiento reducido.", tags: ["GSAP", "SVG", "Accesibilidad"] },
];
export const TECHNOLOGIES = [
  { title: "React y Next.js" },
  { title: "Tailwind CSS" },
  { title: "GSAP" },
  { title: "Node.js y Express" },
  { title: "PostgreSQL" },
];
// Propuestas del portfolio; todavía no representan demos publicadas.
// Sin demoHref: no se fabrican rutas a aplicaciones que aún no existen.
export const PROJECTS = [
  { id: "turnos", title: "Gestor de Turnos & Agenda Web", description: "Propuesta de reserva horaria con prevención de solapamientos y panel de administración.", preview: "/previews/turnos.svg" },
  { id: "metricas", title: "Dashboard de Métricas & Tráfico", description: "Propuesta de panel con gráficos de visitas, tráfico público y usuarios autenticados.", preview: "/previews/metricas.svg" },
  { id: "tienda", title: "E-Commerce con API de Pagos", description: "Propuesta de catálogo, carrito y validación de stock con integración de pagos.", preview: "/previews/tienda.svg" },
  { id: "reservas", title: "Portal de Reservas Gastronómicas", description: "Propuesta de reservas con selección de comensales y validación de fechas.", preview: "/previews/reservas.svg" },
];
