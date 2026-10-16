/**
 * Nivel 2 de DESIGN.md: define el contexto cromático de sus descendientes.
 *
 * Tema (data-pal) y modo (data-theme) viven en <html>. Section no los consulta:
 * globals.css resuelve los valores y CSS los transmite por herencia. Por eso
 * este componente no necesita estado, efectos ni "use client".
 *
 * Superficies recomendadas:
 *   page       primer fondo; acción con el primer color de la colección.
 *   card       segundo fondo; acción con el segundo color.
 *   muted      tercer fondo; acción con el tercer color.
 *   primary    primer color como fondo, texto y acciones invertidos.
 *   secondary  segundo color como fondo, texto y acciones invertidos.
 *   accent     tercer color como fondo, texto y acciones invertidos.
 *   deep       oscuro profundo en ambos modos, con acciones de alto contraste.
 *
 * Props:
 *   surface    "page" | "card" | "muted" | "primary" | "secondary" | "accent" |
 *              "deep"
 *              (por defecto "page")
 *   as         etiqueta HTML a usar: "section", "header", "div"... (por defecto "section")
 *   className  layout, espaciado y forma; evitar colores que rompan el contexto.
 *   ...rest    atributos HTML, ref, id, aria-labelledby, eventos, etc.
 *
 * Ejemplo:
 *   <Section surface="deep" className="py-section px-gutter" id="proyectos">
 *     <Button>Ver proyectos</Button>
 *     <Section as="article" surface="card" className="rounded-card p-6">
 *       <Button variant="accent">Ver perfil</Button>
 *     </Section>
 *   </Section>
 *
 * El primer Button hereda deep; el segundo hereda card. La Section anidada
 * reinicia TODOS los roles --s-* sin arrastrar combinaciones del padre.
 * Inputs y futuros componentes usan ese mismo contrato sin recibir HEX.
 * Si un diálogo se monta en un portal, darle su propia Section: CSS hereda
 * del DOM real, no del árbol de componentes de React.
 */
const SURFACES = new Set([
    "page", "card", "muted", "primary", "secondary", "accent", "deep",
]);

export default function Section({
    surface = "page",
    as: Tag = "section",
    className = "",
    children,
    ...rest
}) {
    // Un valor desconocido vuelve al contexto base. Esta lista coincide con
    // los selectores de globals.css; no contiene colores ni lógica por tema.
    const context = SURFACES.has(surface) ? surface : "page";

    return (
        <Tag
            {...rest}
            // El atributo establece el contexto; las clases pintan ese mismo
            // fondo y texto. rest va antes para no sobrescribirlos por accidente.
            data-surface={context}
            className={`bg-surface text-on-surface ${className}`.trim()}
        >
            {children}
        </Tag>
    );
}
