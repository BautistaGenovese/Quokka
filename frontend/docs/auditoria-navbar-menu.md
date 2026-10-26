# Auditoría de navbar, menú y navegación

Fecha: 25 de octubre de 2026. Rama: `fix/frontend-diseno-rendimiento`, sobre `3fe1458` y los cambios locales actuales. Auditoría de frontend; no se aplicaron correcciones durante esta revisión.

## Estado después de aplicar las correcciones

Los nueve hallazgos de esta auditoría tienen corrección implementada en frontend. El detalle original se conserva debajo como evidencia del estado anterior.

- El menú tiene un único scroll en su tarjeta: en el mismo caso de 768 × 360, la lista pasa de 0 a 317 px de contenido accesible. Las acciones inferiores son más compactas y se llega a ellas con teclado o desplazamiento.
- Menú y paleta desactivan su contenido con `inert` al comenzar el cierre y resuelven el foco antes de animar la salida. Reabrir habilita de nuevo los controles y restablece el scroll del menú.
- La cubierta instala sus listeners bloqueantes solo durante la transición y los libera al terminar, cancelar, cambiar a movimiento reducido o desmontarse.
- El timeline compone los dos trazados desde una actualización compartida, sin un callback de render por punto.
- La verificación de sesión se comparte entre consumidores, tiene una caché breve de 30 segundos y un timeout de 10 segundos. Una respuesta de una sesión anterior no sobrescribe ni elimina la cuenta actual. Un fallo temporal permite reintentar; un 401 vigente borra la sesión.
- La sección activa usa geometrías cacheadas, invalidadas por ResizeObserver y cambios de tamaño. Desplazar la página no vuelve a leer geometrías.
- El acceso al panel espera montaje y verificación; la sección activa se identifica visualmente con un subrayado discreto, sin marcador circular.
- Login y detalle incluyen un enlace de salto a un main enfocable, con separación de la barra sticky.
- La entrada de los enlaces es más breve. Se conserva el vidrio del navbar: no se había probado que fuera la causa de los tirones.

Regresiones automatizadas: **57 pruebas aprobadas**, incluidas deduplicación y caducidad de sesión, cambios de cuenta con respuesta pendiente, geometrías cacheadas, cierre inerte de menú/paleta, ciclo de listeners y composición SVG compartida. El caso horizontal y Tab durante el cierre también se comprobaron en el navegador. No se promete una cifra de FPS sin una traza del equipo afectado.

## Alcance y método

- Revisión del código compartido de navbar, menú, paleta, navegación, animaciones y autenticación.
- Navegador local: portada con y sin sesión, login, detalle de proyecto y dashboard con la cuenta administradora de revisión. Producción en `127.0.0.1:3013` y panel de desarrollo en `127.0.0.1:3012`.
- Portada: consistencia de los siete destinos y sus superficies. Panel: los seis enlaces apuntan a elementos existentes. Pruebas de apertura, cierre, Escape, Tab, cambio de menú a paleta y navegación por anclas/rutas.
- Vistas verificadas: móvil de 390 × 844, tablet de 768 × 800, escritorio de 1280 × 720 y horizontal de 768 × 360. Las dimensiones son CSS observadas en la página.
- Comprobación de 70 pares nominales de tinta/fondo: cinco paletas, dos modos y siete superficies. No equivale a verificar cada composición del vidrio sobre imágenes.
- Dos reproducciones aisladas de hooks reales, con red y DOM simulados, para contar consultas de sesión y lecturas de geometría. No se presentan como métricas de tiempo del navegador.
- Criterio: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

No se ensayó una sesión de operador ni un lector de pantalla real. El manejo de movimiento reducido se revisó en código y en la suite existente, sin cambiar la preferencia del sistema. No se capturó una traza de CPU/GPU ni se midieron FPS en el PC donde se producen los tirones.

Incidencia pendiente de reproducir: en un regreso del detalle a `/#proyectos`, el navegador integrado mostró un error de carga propio; recargar recuperó la portada. No se atribuye al código del sitio ni se cuenta entre los hallazgos confirmados sin aislar primero la causa.

## Hallazgos, por prioridad

### 1. P1 — El menú del panel pierde todas sus secciones en horizontal

`frontend/styles/navigation.css:18`, `frontend/styles/navigation.css:39`, `frontend/styles/navigation.css:95` y `frontend/components/navigation/menu-sitio.jsx:196`.

Reproducción: iniciar sesión como administrador, abrir `/panel` a 768 × 360 y abrir Menú. El panel mide 252 px de alto útil; las acciones inferiores ocupan 147 px. El `nav` termina con **0 px de alto**, aunque su contenido requiere 317 px. La captura muestra únicamente título, ayuda y botones de salida. Las secciones quedan inaccesibles con el puntero.

Corrección: un único contenedor desplazable para el contenido completo en ventanas bajas; evitar que el footer inflexible consuma el espacio del `nav`. Reducir la jerarquía visual de las acciones de cuenta y mantener un área mínima utilizable para los destinos.

### 2. P2 — Los enlaces siguen recibiendo foco durante el cierre

`frontend/components/navigation/menu-sitio.jsx:109` y `frontend/components/navigation/panel-paletas.jsx:83`.

Reproducción en la portada: cerrar el menú y pulsar Tab inmediatamente. Se observó `data-exiting="true"`, diálogo todavía abierto, disparador colapsado y foco en el enlace Inicio dentro del panel saliente. El final del cierre puede devolver después el foco al disparador. La paleta conserva el mismo patrón de cierre.

Corrección: desactivar interacción y tabulación del contenido al iniciar la salida; resolver el destino del foco antes de retirarlo. Mantener independiente la animación decorativa. Añadir una prueba que pulse Tab antes de completar el tween de cierre.

### 3. P2 — Listeners globales de scroll potencialmente bloqueantes en reposo

`frontend/components/navigation/transicion-seccion.jsx:116`.

`wheel` y `touchmove` se registran con `passive: false` durante toda la vida de la transición global. Aunque el callback solo cancela eventos cuando la cubierta está activa, el navegador debe contemplar esa posibilidad en cada gesto sobre el documento.

Corrección: registrar estos listeners únicamente mientras la cubierta necesite bloquear el desplazamiento y retirarlos al finalizar, cancelar o desmontarse. Verificar scroll continuo con la cubierta inactiva. No se cuantificó aquí el retraso real de entrada.

### 4. P2 — Repetición del render SVG dentro de cada frame de transición

`frontend/components/navigation/transicion-seccion.jsx:72` y `frontend/components/navigation/transicion-seccion.jsx:82`.

Cada pasada crea 20 tweens: diez puntos por cada una de las dos capas. Cada tween tiene un `onUpdate` que vuelve a construir y escribir ambos trazados completos. Con los 20 tweens activos, una actualización puede ejecutar hasta 40 escrituras de `d`, cuando bastarían dos. Este trabajo ocurre al navegar, no durante todo el scroll.

Corrección: actualizar los valores de los puntos y realizar una sola composición de los dos trazados por frame, desde el timeline o una actualización compartida. Comprobar que se conservan la forma y los desfases actuales. Evaluar después con una traza si conviene reemplazar el morphing por una cubierta basada en transforms.

### 5. P2 — La misma sesión se verifica varias veces al montar una página

`frontend/hooks/use-autenticacion.js:64` y `frontend/components/navigation/navbar.jsx:25`.

Navbar y el consumidor de la página instancian `useAuth` por separado: galería de portada, formulario de login, detalle y página del panel. Cada instancia con token lanza su propio `/api/auth/me`. Una reproducción aislada del hook real dio dos peticiones para dos montajes; no hay deduplicación compartida. La respuesta también actualiza el almacenamiento y notifica a sus suscriptores.

Corrección: resolver la verificación de sesión en un proveedor o store compartido y reutilizar estado, resultado y petición en curso. Mantener el rol actualizado desde el servidor; no sustituir la autorización por datos de localStorage.

### 6. P2 — Lecturas de geometría al desplazar, con el menú cerrado

`frontend/hooks/use-active-section.js:17`.

El seguimiento de sección activa consulta la geometría de todos los destinos en cada frame de scroll procesado. No considera si el menú está abierto. Reproducción aislada: cien eventos se agruparon correctamente en un frame, pero ese frame hizo siete lecturas de geometría para la portada. En reposo no quedaron frames pendientes.

Corrección: usar IntersectionObserver o posiciones cacheadas e invalidadas al cambiar el layout; compartir la información con el seguimiento del navbar cuando resulte conveniente. Conservar la actualización de sección activa y el caso del último bloque corto. Las lecturas observadas no prueban por sí solas un reflow forzado en cada frame.

### 7. P2 — El acceso al panel aparece antes de conocer la sesión

`frontend/components/navigation/navbar.jsx:41`.

`showPanelButton` incluye `!mounted` para satisfacer contratos de render estático. Eso dibuja Panel de control en HTML inicial incluso para visitantes anónimos; al hidratar desaparece. Se observó el botón transitorio al cargar vistas públicas durante la revisión. Introduce movimiento de controles y una indicación de acceso incorrecta. La protección real del backend continúa vigente.

Corrección: estado inicial estable y coherente con permisos todavía desconocidos, sin condicionar el producto a un contrato de test. Probar SSR, hidratación y comprobación pendiente de token.

### 8. P2 — Falta un acceso para saltar la cabecera en login y detalle

`frontend/components/navigation/pagina-login.jsx:14` y `frontend/components/portfolio/detalle-proyecto.jsx:50`.

Portada y panel incluyen Saltar al contenido. Login y detalle no tienen un enlace equivalente ni un destino identificable y enfocable en su `main`. La navegación por teclado cambia según la página.

Corrección: ofrecer el mismo patrón en las cuatro familias de páginas y comprobar que el destino no quede cubierto por la barra sticky.

### 9. P3 — La sección activa solo se comunica mediante ARIA

`frontend/components/navigation/menu-sitio.jsx:184` y `frontend/styles/navigation.css:23`.

Se establece `aria-current="location"`, pero los estilos no distinguen ese enlace. Visualmente todos los destinos se presentan iguales; la persona pierde la referencia de dónde está.

Corrección: subrayado persistente de sección activa, distinguible sin depender solo del color. Se retiró el marcador circular para mantener el menú más limpio. Hover, foco y estado actual permanecen separados.

## Aspectos que funcionan

- Identificadores de controles y paneles independientes; botones con nombres accesibles y enlaces nativos para navegación.
- Escape, primer Tab dentro del menú y alternancia con la paleta funcionan en las pruebas realizadas. El foco que abandona un panel lo retira sin cubrir el siguiente control.
- Destinos del panel existentes y navegación compartida entre anclas y rutas.
- Cabecera sin desborde horizontal en las vistas normales verificadas, incluida la portada autenticada a 768 px.
- Los hooks de scroll agrupan eventos por frame y limpian sus listeners; el navbar no necesita un bucle continuo en reposo.
- Animaciones interrumpibles y tratamiento de movimiento reducido presentes en el código.
- Los 70 pares nominales de texto/fondo dieron un mínimo calculado de **5,20:1**. Este cálculo no certifica el contraste del fondo transparente en cada posición del scroll.
- Suite actual: **48 pruebas aprobadas**. Los dos fallos de interacción reproducidos no están cubiertos por esos tests.

## Mejoras de diseño y puntos pendientes de medir

La entrada del último enlace de un menú de siete destinos termina aproximadamente a los 1,27 s según los parámetros del tween: inicio de 0,15 s, duración de 0,7 s y seis escalones de 0,07 s. Conviene acortar la secuencia y dar feedback inmediato; es una duración calculada del código, no una medición de latencia del equipo.

El navbar combina `backdrop-filter: blur(10px)` y una máscara a todo su ancho (`frontend/styles/navbar.css:61`). Es un candidato para comparar con un fondo más opaco en una traza de GPU/CPU, especialmente sobre demos y gráficos. **No hay evidencia suficiente para atribuirle los tirones actuales** ni para prometer una mejora de FPS al retirarlo.

Orden de trabajo recomendado: recuperar los enlaces en horizontal; corregir foco durante cierre; reducir listeners y actualizaciones SVG; centralizar sesión y seguimiento de secciones; unificar estados iniciales, accesos de teclado y marcador activo. Todo puede resolverse en frontend.
