"use client";

import { useState } from "react";
import useAppearance from "@/hooks/use-appearance";
import Button from "@/components/ui/button.jsx";
import Section from "@/components/section";
import Navbar from "@/components/navbar";
import ProjectCard from "@/components/cards/project-card";
import DemoCard from "@/components/cards/demo-card";
import DemoPreview from "@/components/cards/demo-preview";
import TeamCard from "@/components/cards/team-card";
import SkillCard from "@/components/cards/skill-card";
import CardSlider from "@/components/ui/card-slider";
import ContactFormDemo from "@/components/contact-form-demo";
import Marquee from "@/components/ui/marquee";
import Footer from "@/components/footer";

const MENU_ITEMS = [
  { href: "#inicio", label: "Inicio", description: "Presentación y guía de pruebas" },
  { href: "#contextos", label: "Colores y contextos", description: "Compará los botones en cada superficie" },
  { href: "#movimiento", label: "Movimiento y estados", description: "Probá magnetismo, presión y carga" },
  { href: "#anidado", label: "Contextos anidados", description: "Descubrí cómo se heredan los colores" },
];

const THEMES = [
  ["eucalipto", "Eucalipto y niebla"], ["salinas", "Salinas"],
  ["marea", "Marea"], ["corteza", "Corteza"],
  ["crepusculo", "Crepúsculo"], ["pastizal", "Pastizal salino"],
];
const SURFACES = [
  ["page", "Fondo principal"], ["card", "Tarjetas"], ["muted", "Fondo alternativo"],
  ["deep", "Oscuro profundo"], ["primary", "Primer color"],
  ["secondary", "Segundo color"], ["accent", "Tercer color"],
];

/** Página temporal de pruebas: cambia el tema global y compara las mismas
 * variantes en cada superficie. Ningún Button recibe colores por props. */
export default function Home() {
  const { theme, mode, setTheme, setMode } = useAppearance();
  const [clicks, setClicks] = useState(0);
  const [sendStatus, setSendStatus] = useState("idle");
  const [showMotionTest, setShowMotionTest] = useState(true);
  const [testMagnetic, setTestMagnetic] = useState(true);
  // Solo una comparación visual del laboratorio; no representa una sesión.
  const [registeredPreview, setRegisteredPreview] = useState(false);

  return (
    <>
      <main>
        <Navbar items={MENU_ITEMS} theme={theme} mode={mode} onThemeChange={setTheme} onModeChange={setMode} />
        <Section as="header" id="inicio" tabIndex={-1} surface="page" className="menu-destination px-gutter py-10">
          <div className="mx-auto max-w-6xl space-y-6">
            <p className="font-mono text-sm">Quokka · pruebas de componentes</p>
            <Button href="/experiencia" magnetic={false} variant="secondary" size="sm">Ver los componentes juntos</Button>
            <h1 className="font-display text-title">Un botón, muchos contextos.</h1>
            <p className="max-w-2xl text-lead">Mové el mouse entre los botones: su contenido también sigue al puntero y al salir vuelven con un rebote suave. Mantené el clic y arrastrá afuera para probar la presión y la retirada del seguidor.</p>
            <div className="flex flex-wrap gap-5">
              <label className="grid gap-2 font-body">
                Colección
                <select value={theme} onChange={e => setTheme(e.target.value)} className="rounded-card border border-field-border bg-field px-4 py-3 text-on-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                  {THEMES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="grid gap-2 font-body">
                Modo
                <select value={mode} onChange={e => setMode(e.target.value)} className="rounded-card border border-field-border bg-field px-4 py-3 text-on-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                  <option value="system">Según el sistema</option>
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </label>
            </div>
            <p role="status" className="font-mono text-sm">Clics de prueba: {clicks}</p>
          </div>
        </Section>

        {/* Cuatro variantes por superficie: incluye borde transparente (ghost). */}
        <div id="contextos" tabIndex={-1} aria-label="Colores y contextos" className="menu-destination mx-auto grid max-w-6xl gap-5 px-gutter pb-10 md:grid-cols-2">
          {SURFACES.map(([surface, title]) => (
            <Section key={surface} surface={surface} className="min-w-0 rounded-card p-6 sm:p-8" aria-labelledby={`title-${surface}`}>
              <p className="mb-2 font-mono text-xs">surface=&quot;{surface}&quot;</p>
              <h2 id={`title-${surface}`} className="mb-6 font-display text-2xl font-bold">{title}</h2>
              <div className="flex flex-wrap items-center gap-5">
                <Button onClick={() => setClicks(n => n + 1)}>Principal</Button>
                <Button variant="secondary" onClick={() => setClicks(n => n + 1)}>Secundario</Button>
                <Button variant="accent" onClick={() => setClicks(n => n + 1)}>Alternativo</Button>
                <Button variant="ghost" onClick={() => setClicks(n => n + 1)}>Ghost</Button>
              </div>
            </Section>
          ))}
          <Section surface="card" className="min-w-0 rounded-card p-6 sm:p-8">
            <h2 className="mb-6 font-display text-2xl font-bold">Tamaños e iconos</h2>
            <div className="flex flex-wrap items-center gap-5">
              <Button size="sm" onClick={() => setClicks(n => n + 1)}>Pequeño</Button>
              <Button size="md" iconLeft={<span aria-hidden="true">＋</span>} onClick={() => setClicks(n => n + 1)}>Agregar</Button>
              <Button size="lg" variant="secondary" iconRight={<span aria-hidden="true">→</span>} href="#movimiento">Grande</Button>
              <Button fullWidth onClick={() => setClicks(n => n + 1)}>Ancho completo</Button>
              <Button size="lg" magnetic={false} iconRight={<span aria-hidden="true">→</span>} onClick={() => setClicks(n => n + 1)}>Un botón con un texto largo también se adapta al ancho disponible</Button>
            </div>
          </Section>
        </div>

        <Section surface="deep" tabIndex={-1} className="menu-destination px-gutter py-10" id="movimiento">
          <div className="mx-auto max-w-6xl space-y-8">
            <h2 className="font-display text-3xl font-bold">Movimiento y estados</h2>
            <div className="flex flex-wrap gap-4">
              <Button motion="subtle" onClick={() => setClicks(n => n + 1)}>Movimiento discreto</Button>
              <Button motion="expressive" onClick={() => setClicks(n => n + 1)}>Movimiento expresivo</Button>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Button magnetic={false} onClick={() => setClicks(n => n + 1)}>Sin magnetismo</Button>
              <Button maxRotation={0} onClick={() => setClicks(n => n + 1)}>Solo desplazamiento</Button>
              <Button strength={0.12} maxRotation={3} variant="secondary" onClick={() => setClicks(n => n + 1)}>Tirón suave</Button>
              <Button motion="expressive" strength={0.4} maxRotation={12} variant="accent" onClick={() => setClicks(n => n + 1)}>Tirón intenso</Button>
              <Button disabled>Deshabilitado</Button>
              <Button loading loadingLabel="Cargando demo…">Carga permanente</Button>
              <Button href="#movimiento" disabled>Enlace deshabilitado</Button>
              <Button href="#anidado" variant="secondary" iconRight="→">Probar enlace</Button>
            </div>
            {/* Controles manuales para observar la carga todo el tiempo necesario
              y probar interrupciones, éxito, error y reintento sin un backend. */}
            <form className="flex flex-wrap items-center gap-5" onSubmit={e => { e.preventDefault(); setSendStatus("loading"); }}>
              <Button type="submit" status={sendStatus} loadingLabel="Cargando...">Probar envío</Button>
              <Button type="button" variant="secondary" magnetic={false} onClick={() => setSendStatus("success")}>Simular éxito</Button>
              <Button type="button" variant="secondary" magnetic={false} onClick={() => setSendStatus("error")}>Simular error</Button>
              <Button type="button" variant="ghost" magnetic={false} onClick={() => setSendStatus("idle")}>Reiniciar envío</Button>
            </form>
            {/* Cambios de props y montaje: verifican limpieza de animaciones,
              sin tener que recargar la página entre cada comparación. */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2"><input type="checkbox" checked={showMotionTest} onChange={e => setShowMotionTest(e.target.checked)} /> Mostrar botón de prueba</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={testMagnetic} onChange={e => setTestMagnetic(e.target.checked)} /> Magnetismo del botón de prueba</label>
              </div>
              {showMotionTest && <Button magnetic={testMagnetic} iconRight="→" onClick={() => setClicks(n => n + 1)}>Probar movimiento del contenido</Button>}
            </div>
            <Section as="article" surface="card" tabIndex={-1} className="menu-destination rounded-card p-6" id="anidado">
              <h3 className="mb-3 font-display text-2xl font-bold">Una tarjeta dentro de una sección profunda</h3>
              <p className="mb-5">Estos botones heredan la tarjeta, aunque el contenedor exterior sea oscuro.</p>
              <div className="flex flex-wrap gap-5">
                <Button onClick={() => setClicks(n => n + 1)}>Contexto de tarjeta</Button>
                <Button variant="accent" maxRotation={10} onClick={() => setClicks(n => n + 1)}>Giro de 10°</Button>
              </div>
            </Section>
            <p className="text-sm">Ghost conserva su borde transparente. El cursor nativo y el foco de teclado siguen disponibles; con movimiento reducido o pantalla táctil se desactivan los efectos.</p>
          </div>
        </Section>
        <Section as="div" surface="primary" id="marquee" className="menu-destination">
          <Marquee label="Diseño, código y movimiento" items={["Diseño con intención", "Código compartido", "Movimiento con personalidad"]} pauseOnHover={false} />
        </Section>
        <Section id="cards" surface="page" className="px-gutter py-section" aria-labelledby="cards-title">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest">Componentes / cards</p>
            <h2 id="cards-title" className="mb-4 font-body text-3xl font-extrabold">Tres contenidos, una misma base.</h2>
            <p className="mb-8 max-w-2xl font-body text-lg">Proyecto y equipo se inclinan suavemente al mover el cursor. La habilidad queda estática para priorizar la lectura. Todos se adaptan a la colección y al modo elegidos.</p>
            {/* La sección decide el ancho; cada variante conserva su proporción.
              Solo se igualan alturas dentro de futuras filas del mismo tipo. */}
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <ProjectCard title="Laboratorio Quokka" description="Nuestro espacio de pruebas para explorar colores, botones y animaciones."
                technologies={["React", "Next.js", "GSAP"]} demoHref="#movimiento" codeHref="https://github.com/BautistaGenovese/Quokka"
                preview={<Section as="div" surface="primary" className="flex min-h-44 flex-col justify-between p-6" aria-hidden="true"><span className="font-mono text-xs">QUOKKA / LAB</span><span className="font-serif text-4xl">Probá. Creá.<br />Explorá.</span></Section>} />
              <div className="min-w-0 space-y-6">
                <TeamCard surface="muted" name="Bautista" role="Desarrollo frontend" description="Construyendo los componentes y las interacciones de Quokka para que todo el equipo pueda reutilizarlos." profileHref="https://github.com/BautistaGenovese" />
                <SkillCard surface="deep" title="Interfaces interactivas" description="Componentes reutilizables que combinan diseño, accesibilidad y movimiento con propósito." icon="↗" tags={["Componentes", "Accesibilidad", "Animación"]} />
              </div>
            </div>
          </div>
        </Section>
        <Section id="demos" surface="muted" className="py-section" aria-labelledby="demos-title">
          <div className="mx-auto max-w-6xl px-gutter">
            <h2 id="demos-title" className="mb-4 font-body text-3xl font-extrabold">Explorá las demos.</h2>
            <p className="mb-8 font-body text-lg font-normal">Arrastrá las tarjetas o usá las flechas. Después de la última, volvés a la primera.</p>
          </div>
          <CardSlider label="Laboratorio de demos Quokka" className="demo-showcase">
            {[
              ["Botones magnéticos", "Probá la atracción del cursor, el relleno y los estados de carga.", "movimiento"],
              ["Colores en contexto", "Una misma colección se adapta a cada superficie de la página.", "contextos"],
              ["Cards con profundidad", "Explorá las tarjetas de equipo, proyectos y habilidades.", "cards"],
              ["Superficies anidadas", "Los componentes toman sus colores de la sección más cercana.", "anidado"],
              ["Laboratorio Quokka", "Volvé al inicio y combiná las pruebas de nuestros componentes.", "inicio"],
            ].map(([title, description, destination]) => (
              <DemoCard key={title} locked={!registeredPreview} title={title} description={description} demoHref={`#${destination}`}
                preview={<DemoPreview src={`/previews/${destination}.jpg`} alt={`Vista previa de ${title}`} />} />
            ))}
          </CardSlider>
          <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 px-gutter text-center">
            <Button magnetic={false} variant="primary" aria-pressed={registeredPreview}
              onClick={() => setRegisteredPreview(previous => !previous)}>
              {registeredPreview ? "Volver a vista bloqueada" : "Registrarse (prueba)"}
            </Button>
            <p className="font-body text-sm" role="status">
              {registeredPreview ? "Vista de cuenta registrada. No se creó ninguna cuenta." : "Simulá una cuenta registrada para comparar los dos estados."}
            </p>
          </div>
        </Section>
        <Section as="div" surface="secondary">
          <Marquee size="sm" label="De la idea a la experiencia" direction="right" speed={55}
            items={["Probá", "Creá", "Compartí", "Volvé a explorar"]} />
        </Section>
        <Section id="formularios" surface="card" className="menu-destination footer-predecessor px-gutter py-section" aria-labelledby="forms-title">
          <div className="mx-auto max-w-3xl">
            <h2 id="forms-title" className="mb-4 font-body text-3xl font-extrabold">Contanos tu idea.</h2>
            <p className="mb-8 font-body text-lg font-normal">Aire: etiquetas flotantes, iconos que se transforman y errores con personalidad.</p>
            <ContactFormDemo />
          </div>
        </Section>
      </main>
      <Footer contactHref="#formularios" teamHref="#cards" links={[
        { href: "#inicio", label: "Inicio" },
        { href: "#contextos", label: "Colores" },
        { href: "#movimiento", label: "Movimiento" },
        { href: "#cards", label: "Cards" },
        { href: "#demos", label: "Demos" },
        { href: "#formularios", label: "Contacto" },
      ]} />
    </>
  );
}
