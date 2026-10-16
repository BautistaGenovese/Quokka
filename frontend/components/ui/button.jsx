"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import useButtonMotion from "@/hooks/use-button-motion";
import ButtonLabel from "./button-label";
import { BUTTON_MOTION } from "@/lib/gsap";

/**
 * Botón del portafolio Quokka.
 *
 * Nivel 3 de DESIGN.md: consume roles de globals.css, sin consultar el tema,
 * el modo claro/oscuro ni códigos HEX. Los tamaños también usan Tailwind.
 *
 * El color NO es fijo: depende del fondo donde esté el botón.
 * Los colores del botón son action / on-action / sweep / alt, y global.css
 * les da un valor distinto según el data-surface de la sección que lo
 * contiene (ver <Section surface="...">). Cambian solos con el tema
 * (data-pal) y con el modo (data-theme).
 *
 * Props:
 *   variant    "primary" | "secondary" | "accent" | "ghost"   (por defecto "primary")
 *   size       "sm" | "md" | "lg"                              (por defecto "md")
 *   type       "button" | "submit" | "reset"                   (por defecto "button")
 *   loading    alias compatible de status="loading"; bloquea los clics
 *   status     "idle" | "loading" | "success" | "error"; lo controla el consumidor
 *   successLabel / errorLabel texto final, por defecto "¡Enviado!" / "¡Error!"
 *   loadingLabel texto visible durante la carga (por defecto "Cargando…")
 *   disabled   deshabilita el botón
 *   fullWidth  ocupa todo el ancho disponible
 *   iconLeft   elemento a la izquierda del texto
 *   iconRight  elemento a la derecha (se desliza al pasar el mouse)
 *   iconOnlyOnMobile oculta visualmente el texto en móvil si hay un icono;
 *                    conserva ese texto como nombre accesible del control.
 *   href       si existe, se dibuja como <a> en vez de <button>
 *   magnetic   el botón se mueve hacia el mouse (por defecto true)
 *   motion     "subtle" (habitual) | "expressive" (acción protagonista)
 *   strength   cuánto se mueve, de 0 a 1 (override del preset)
 *   maxRotation giro máximo, de 0 a 15 (override del preset; 0 lo desactiva)
 *   className  clases extra de Tailwind (por ejemplo "mt-4")
 *   ...rest    todo lo demás pasa tal cual: onClick, id, aria-label, etc.
 *
 * Ejemplos:
 *   <Button>Ingresar</Button>
 *   <Button variant="secondary" iconRight={<span>→</span>}>Ver demo</Button>
 *   <Button type="submit" loading={enviando}>Enviar consulta</Button>
 *   <Button href="#contacto" variant="ghost" magnetic={false}>Contacto</Button>
 *   <Button variant="ghost" aria-label="Cerrar menú">×</Button>
 *
 * El contexto se declara en el contenedor, no en cada botón:
 *   <Section surface="deep"><Button>Ver proyectos</Button></Section>
 * Una Section anidada reinicia los roles de sus descendientes.
 * No reemplazar bg-action/text-on-action por colores globales como bg-primary:
 * se perdería la adaptación a la superficie cercana. Reservar className para layout.
 */

/* Lo que comparten todos los botones: forma, tipografía, foco y estados. */
// justify-center centra el grupo; text-center evita heredar la alineación
// de la sección en las etiquetas multilínea y los cambios de estado.
const BASE =
  "relative isolate inline-flex min-w-0 max-w-full items-center justify-center gap-2 overflow-hidden " +
  "rounded-[2rem] border-2 max-sm:px-4 font-body font-semibold text-center tracking-normal leading-[1.1] cursor-pointer select-none " +
  "transition-colors duration-300 ease-expo motion-reduce:transition-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

/* La capa radial nace donde entra el puntero, como si el seguidor aportara
   el relleno. CSS recorta el círculo dentro de la píldora; los colores siguen
   perteneciendo a cada variante y a la sección más cercana. */
const SWEEP = "button-radial-fill before:absolute before:inset-0 before:-z-10";

/* Cómo se ve cada variante. Los nombres (action, on-action, sweep, alt)
   no son colores fijos: cambian según el fondo donde esté el botón. */
// Base e interacción están separadas: loading/disabled conservan los colores
// de reposo, sin que el hover ni el foco vuelvan a pintar un control inactivo.
const FILLED_INTERACTION =
  "before:bg-sweep hover:border-sweep hover:text-on-sweep " +
  "data-[cursor-ink=true]:text-on-sweep " +
  "focus-visible:border-sweep focus-visible:text-on-sweep";

const VARIANTS = {
  primary: {
    base: "border-action bg-action text-on-action",
    interactive: FILLED_INTERACTION,
  },
  secondary: {
    base: "border-action bg-transparent text-action",
    interactive: "before:bg-action hover:text-on-action data-[cursor-ink=true]:text-on-action focus-visible:text-on-action",
  },
  accent: {
    // Cada relleno tiene su par: alt/on-alt, no alt/on-action.
    base: "border-alt bg-alt text-on-alt",
    interactive: FILLED_INTERACTION,
  },
  ghost: {
    base: "border-transparent bg-transparent text-action",
    // Overlay derivado del rol local, permitido por el manual.
    interactive: "before:bg-action/10",
  },
};

/* md fija la referencia en 1.5rem. sm/lg conservan la proporción anterior
   (8/9 y 10/9 de md); peso, espaciado e interlineado se comparten en BASE. */
const SIZES = {
  sm: "px-4 py-2 text-[1.333333rem]",
  md: "px-6 py-3 text-[1.5rem]",
  lg: "px-8 py-4 text-[1.666667rem]",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    type = "button",
    loading: loadingProp = false,
    status = "idle",
    successLabel = "¡Enviado!",
    errorLabel = "¡Error!",
    loadingLabel = "Cargando…",
    disabled = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    iconOnlyOnMobile = false,
    href,
    magnetic = true,
    motion = "subtle",
    strength,
    maxRotation,
    className = "",
    onClick,
    tabIndex,
    ...rest
  },
  forwardedRef,
) {
  const ref = useRef(null);
  const contentRef = useRef(null);
  // El resultado no se inventa ni se reinicia con un temporizador interno:
  // la petición real decide cuándo termina y si permite reintentar.
  const loading = loadingProp || status === "loading";
  const resultLabel = status === "success" ? successLabel : status === "error" ? errorLabel : undefined;
  // aria-disabled también bloquea la interacción; no es solo una señal visual.
  const inactive = disabled || loading || rest["aria-disabled"] === true || rest["aria-disabled"] === "true";
  // Error es un estado semántico, independiente de la paleta y variante.
  const appearance = status === "error" && !loading ? {
    base: "border-error bg-error text-on-error",
    interactive: "before:bg-on-error hover:border-error hover:text-error data-[cursor-ink=true]:text-error focus-visible:text-error",
  } : VARIANTS[variant] ?? VARIANTS.primary;
  // Sin icono, conservar siempre el texto: nunca producir un botón vacío.
  const compactOnMobile = iconOnlyOnMobile && Boolean(iconLeft || iconRight);

  // Si alguien le pasa un ref al botón, recibe el mismo elemento.
  useImperativeHandle(forwardedRef, () => ref.current);

  // El hook coordina magnetismo, contenido, presión y retorno elástico.
  const movement = BUTTON_MOTION[motion] ?? BUTTON_MOTION.subtle;
  useButtonMotion(ref, contentRef, { inactive, href, magnetic,
    strength: strength ?? movement.strength, maxRotation: maxRotation ?? movement.maxRotation,
    motion: motion === "expressive" ? "expressive" : "subtle" });

  /* FALLBACK DEL RELLENO PARA TECLADO Y TACTO
     Independiente del magnetismo: funciona también con magnetic={false}.
     El mouse recibe el círculo real desde CursorFollower; no nace otro círculo
     en pointerenter. Los listeners nativos preservan los handlers
     onPointerEnter/onFocus que los consumidores pasen mediante ...rest. */
  useEffect(() => {
    const el = ref.current;
    if (!el || inactive) return;
    const setOrigin = (event) => {
      const box = el.getBoundingClientRect();
      const styles = getComputedStyle(el);
      const width = parseFloat(styles.width) || el.offsetWidth;
      const height = parseFloat(styles.height) || el.offsetHeight;
      // Deshacer el giro magnético para convertir coordenadas de pantalla
      // a coordenadas locales. El centro del bounding box incluye translate.
      const angle = (parseFloat(styles.rotate) || 0) * Math.PI / 180;
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const x = Math.cos(angle) * dx + Math.sin(angle) * dy + width / 2;
      const y = -Math.sin(angle) * dx + Math.cos(angle) * dy + height / 2;
      const percent = (value, size) => `${Math.max(0, Math.min(100, value / Math.max(size, 1) * 100))}%`;
      el.style.setProperty("--button-fill-x", percent(x, width));
      el.style.setProperty("--button-fill-y", percent(y, height));
    };
    const onFocus = () => {
      if (!el.matches(":focus-visible")) return;
      // Teclado: no hay un punto de entrada del mouse; expandir desde el centro.
      el.style.removeProperty("--button-fill-x");
      el.style.removeProperty("--button-fill-y");
    };
    // El mouse lo coordina CursorFollower desde la posición REAL de la bolita.
    // Aquí solo queda el fallback táctil; no iniciar otra animación en hover.
    const onPress = (event) => { if (event.pointerType !== "mouse") setOrigin(event); };
    el.addEventListener("pointerdown", onPress);
    el.addEventListener("focus", onFocus);
    return () => {
      el.removeEventListener("pointerdown", onPress);
      el.removeEventListener("focus", onFocus);
      el.style.removeProperty("--button-fill-x");
      el.style.removeProperty("--button-fill-y");
    };
  }, [inactive, href]);

  const classes = [
    "group",
    BASE,
    !inactive && "button-press",
    appearance.base,
    !inactive && SWEEP,
    !inactive && appearance.interactive,
    SIZES[size] ?? SIZES.md,
    fullWidth && "w-full",
    compactOnMobile && "button-icon-mobile",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  /* El contenido va dentro de un <span> para quedar por encima de la capa. */
  const content = (
    /* min-w-0 permite que el texto se ajuste dentro de flex sin empujar
        al botón fuera del contenedor. Los iconos conservan su tamaño. */
    <span ref={contentRef} className="relative flex min-w-0 max-w-full items-center justify-center gap-2">
      {!loading && iconLeft && <span className="shrink-0">{iconLeft}</span>}
      {/* La carga se indica con texto y puntos, sin spinner. */}
      {/* No convertir JSX (por ejemplo un icono de cerrar) en texto. */}
      {(typeof children === "string" || typeof children === "number") &&
        (resultLabel == null || typeof resultLabel === "string" || typeof resultLabel === "number") &&
        (typeof loadingLabel === "string" || typeof loadingLabel === "number") ? (
        <ButtonLabel loading={loading} loadingLabel={loadingLabel} resultLabel={resultLabel}>{children}</ButtonLabel>
      ) : (
        <span className="button-label min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere]">{loading ? loadingLabel : resultLabel ?? children}</span>
      )}
      {!loading && iconRight && (
        <span className="shrink-0">
          {iconRight}
        </span>
      )}
    </span>
  );

  // Los enlaces no admiten disabled nativo. Retirar href y el foco no basta:
  // también impedimos onClick y la propagación hacia contenedores interactivos.
  function handleClick(event) {
    if (inactive) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  }

  /* Con href: es un enlace (navega). Sin href: es un botón (hace una acción).
     rest va primero para no sobrescribir las garantías de disabled/loading. */
  if (href) {
    return (
      <a
        {...rest}
        ref={ref}
        role="link"
        data-cursor-button={!inactive ? "true" : undefined}
        href={inactive ? undefined : href}
        aria-disabled={inactive || undefined}
        aria-busy={loading || undefined}
        tabIndex={inactive ? -1 : tabIndex}
        className={classes}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      data-cursor-button={!inactive ? "true" : undefined}
      disabled={inactive}
      aria-busy={loading || undefined}
      aria-disabled={inactive || undefined}
      tabIndex={tabIndex}
      className={classes}
      onClick={handleClick}
    >
      {content}
    </button>
  );
});

export default Button;
