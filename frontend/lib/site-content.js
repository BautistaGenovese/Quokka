// Contenido del portfolio separado del layout. Integrantes y responsabilidades
// tomados de Bitacora de Leng IV.pdf (Sprint 2); no son perfiles ficticios.
export const TEAM = [
  { name: "Bautista Genovese", role: "Componentes reutilizables y UX/UI", description: "Maquetación de botones, formularios, tarjetas y carruseles, con adaptación a computadoras y celulares.", profileHref: "https://github.com/BautistaGenovese" },
  { name: "Juan Girón", role: "Autenticación y gestión de usuarios", description: "Registro e inicio de sesión, validación de campos y control de acceso según los roles de la plataforma." },
  { name: "Lautaro Jándula", role: "Proyectos y demos", description: "Interfaz de proyectos, acceso condicionado a la sesión y gestión de contenido de las demos." },
  { name: "Ignacio Giangrieco", role: "Backend y contacto", description: "Arquitectura del servidor, conexión con la base de datos y recepción de consultas y solicitudes." },
  { name: "Micaías Villa", role: "Animaciones e integraciones", description: "Transiciones de página, animaciones de componentes e integración de APIs externas." },
];
export const SITE_LINKS = [
  { href: "#inicio", label: "Inicio" }, { href: "#manifiesto", label: "Filosofía" },
  { href: "#equipo", label: "Equipo" }, { href: "#servicios", label: "Servicios" },
  { href: "#stack-tech", label: "Tecnologías" }, { href: "#proyectos", label: "Proyectos y demos" },
  { href: "#contacto", label: "Contacto" },
];
export const SERVICES = [
  { title: "Desarrollo Web Fullstack", description: "Interfaces adaptables, componentes reutilizables y un backend modular para aplicaciones web.", tags: ["React", "Node.js", "Responsive"] },
  { title: "APIs y bases de datos", description: "Endpoints REST, modelado de datos y validación de solicitudes para conectar las distintas partes del sistema.", tags: ["Express", "PostgreSQL", "REST"] },
  { title: "Motion Design", description: "Transiciones y microinteracciones que acompañan la navegación, respetando teclado y movimiento reducido.", tags: ["GSAP", "SVG", "Accesibilidad"] },
];
export const TECHNOLOGIES = [
  { title: "React y Next.js", description: "La base del frontend: vistas y componentes que el grupo puede compartir y mantener.", tags: ["JavaScript", "Componentes"] },
  { title: "Tailwind CSS", description: "Estilos responsivos y tokens compartidos para conservar la identidad en cada sección.", tags: ["Diseño", "Responsive"] },
  { title: "GSAP", description: "Un vocabulario común para animaciones de interacción, navegación y scroll.", tags: ["Motion", "SVG"] },
  { title: "Node.js y Express", description: "Servidor y rutas de la API para los módulos de la aplicación.", tags: ["Backend", "API REST"] },
  { title: "PostgreSQL", description: "Base de datos relacional elegida en el entorno actual del backend.", tags: ["SQL", "Datos"] },
];
// Propuestas del prototipo; todavía no representan demos publicadas.
// Sin demoHref: no se fabrican rutas a aplicaciones que aún no existen.
export const PROJECTS = [
  { id: "turnos", title: "Gestor de Turnos & Agenda Web", description: "Propuesta de reserva horaria con prevención de solapamientos y panel de administración.", preview: "/previews/turnos.svg" },
  { id: "metricas", title: "Dashboard de Métricas & Tráfico", description: "Propuesta de panel con gráficos de visitas, tráfico público y usuarios autenticados.", preview: "/previews/metricas.svg" },
  { id: "tienda", title: "E-Commerce con API de Pagos", description: "Propuesta de catálogo, carrito y validación de stock con integración de pagos.", preview: "/previews/tienda.svg" },
  { id: "reservas", title: "Portal de Reservas Gastronómicas", description: "Propuesta de reservas con selección de comensales y validación de fechas.", preview: "/previews/reservas.svg" },
];
