"use client";

import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import { panelRequest } from "@/lib/panel-api";
import { PanelHeading } from "./panel-compartido";

// Nombres legibles de cada sección de la portada (clave = id de la <Section>)
const NOMBRES_SECCIONES = {
  inicio: "Inicio",
  manifiesto: "Filosofía",
  equipo: "Equipo",
  servicios: "Servicios",
  proyectos: "Proyectos",
  "stack-tech": "Herramientas",
  contacto: "Contacto",
};

const COLOR_REGISTRADAS = "var(--s-action, #6d4aff)";
// Gris oscuro derivado del color de texto del tema: se lee bien en modo claro y oscuro
const COLOR_ANONIMAS = "color-mix(in srgb, var(--s-fg, #1f2937) 75%, transparent)";

/** Devuelve la fecha (AAAA-MM-DD) de hace `dias` días, en hora local. */
function fechaHaceDias(dias) {
  const fecha = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Suma el total de un arreglo de filas para un campo dado. */
const sumar = (filas, campo) => filas.reduce((acumulado, fila) => acumulado + (fila[campo] || 0), 0);

/**
 * Panel de métricas del administrador: visitas por día (anónimas vs. registradas)
 * y embudo de secciones alcanzadas en la portada. Consume
 * `GET /api/metricas/visitas` y `GET /api/metricas/secciones`.
 */
export default function MetricsManager() {
  const [desde, setDesde] = useState(() => fechaHaceDias(30));
  const [hasta, setHasta] = useState(() => fechaHaceDias(0));
  const [tipo, setTipo] = useState("todas");
  const [version, setVersion] = useState(0);
  const [estado, setEstado] = useState({ cargando: true, error: null, porDia: [], porSeccion: [] });

  useEffect(() => {
    const controlador = new AbortController();
    const parametros = `?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}&tipo=${tipo}`;

    Promise.all([
      panelRequest(`/api/metricas/visitas${parametros}`, { signal: controlador.signal }),
      panelRequest(`/api/metricas/secciones${parametros}`, { signal: controlador.signal }),
    ]).then(
      ([visitas, secciones]) => {
        if (controlador.signal.aborted) return;
        setEstado({
          cargando: false,
          error: null,
          // Se recorta la fecha ISO a AAAA-MM-DD para mostrarla en el eje
          porDia: (visitas.datos || []).map((fila) => ({ ...fila, dia: String(fila.dia).slice(0, 10) })),
          porSeccion: (secciones.datos || []).map((fila) => ({ ...fila, nombre: NOMBRES_SECCIONES[fila.seccion] || fila.seccion })),
        });
      },
      (error) => {
        if (controlador.signal.aborted) return;
        setEstado((anterior) => ({ ...anterior, cargando: false, error }));
      },
    );
    return () => controlador.abort();
  }, [desde, hasta, tipo, version]);

  const { cargando, error, porDia, porSeccion } = estado;
  const totalVisitas = sumar(porDia, "total");
  const totalRegistradas = sumar(porDia, "registradas");
  const sinPermiso = error && (error.status === 401 || error.status === 403);
  const vacio = !cargando && !error && totalVisitas === 0 && sumar(porSeccion, "total") === 0;

  const recargar = () => { setEstado((anterior) => ({ ...anterior, cargando: true, error: null })); setVersion((valor) => valor + 1); };

  return <>
    <PanelHeading
      eyebrow="Analíticas"
      title="Métricas"
      description="Visitas por día y hasta qué sección de la portada llegan las personas, distinguiendo quienes iniciaron sesión de quienes no."
    />

    <div className="panel-sheet panel-metrics-filters">
      <Input label="Desde" type="date" value={desde} max={hasta} onChange={(evento) => setDesde(evento.target.value)} />
      <Input label="Hasta" type="date" value={hasta} min={desde} onChange={(evento) => setHasta(evento.target.value)} />
      <Select label="Tipo de visitas" value={tipo} onValueChange={setTipo}>
        <option value="todas">Todas</option>
        <option value="registradas">Solo registradas</option>
      </Select>
    </div>

    {cargando && <p role="status" className="panel-state">Cargando métricas…</p>}

    {error && <div className="panel-sheet panel-state" role="alert">
      <h3>{sinPermiso ? "Sin permiso" : "No pudimos cargar las métricas"}</h3>
      <p>{sinPermiso ? "Las métricas son exclusivas del administrador." : error.message}</p>
      {!sinPermiso && <Button size="sm" variant="secondary" magnetic={false} onClick={recargar}>Volver a intentar</Button>}
    </div>}

    {vacio && <div className="panel-sheet panel-state"><h3>Sin visitas en este período</h3><p>Probá ampliando el rango de fechas.</p></div>}

    {!cargando && !error && !vacio && <div className="panel-metrics-grid">
      <ul className="panel-metrics-totals" aria-label="Resumen del período">
        <li><strong>{totalVisitas}</strong> visitas en total</li>
        <li><strong>{totalRegistradas}</strong> de personas registradas</li>
        <li><strong>{totalVisitas - totalRegistradas}</strong> anónimas</li>
      </ul>

      <section className="panel-sheet panel-metrics-chart" aria-label="Visitas por día">
        <h3>Visitas por día</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={porDia} margin={{ top: 8, right: 24, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="dia" tick={{ fontSize: 12 }} padding={{ left: 24, right: 24 }} minTickGap={24} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="registradas" name="Registradas" stroke={COLOR_REGISTRADAS} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="anonimas" name="Anónimas" stroke={COLOR_ANONIMAS} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="panel-sheet panel-metrics-chart" aria-label="Secciones alcanzadas">
        <h3>Hasta dónde llegan en la portada</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={porSeccion} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="nombre" width={100} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="registradas" name="Registradas" stackId="visitas" fill={COLOR_REGISTRADAS} />
            <Bar dataKey="anonimas" name="Anónimas" stackId="visitas" fill={COLOR_ANONIMAS} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>}
  </>;
}
