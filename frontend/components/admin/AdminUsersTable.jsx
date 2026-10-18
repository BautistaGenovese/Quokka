"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Button from "@/components/ui/button";
import Section from "@/components/layout/section";
import {
  getAdminUsers,
  updateAdminUserRol,
  deleteAdminUser,
} from "@/lib/auth-api";

export default function AdminUsersTable({ adminUsuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [notificacion, setNotificacion] = useState(null);

  // Estados de acciones por fila
  const [actualizandoId, setActualizandoId] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const [, startTransition] = useTransition();

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const data = await getAdminUsers({
        busqueda: busqueda.trim(),
        rol: filtroRol,
      });
      setUsuarios(data.usuarios || []);
      if (data.estadisticas) {
        setEstadisticas(data.estadisticas);
      }
    } catch (err) {
      setError(err.message || "Error al cargar la lista de usuarios.");
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroRol]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarUsuarios();
    }, 250);
    return () => clearTimeout(timer);
  }, [cargarUsuarios]);

  // Manejar cambio de rol
  const handleCambiarRol = async (userId, nuevoRol, nombreUsuario) => {
    setActualizandoId(userId);
    setError("");
    try {
      await updateAdminUserRol(userId, nuevoRol);
      setNotificacion({
        tipo: "exito",
        mensaje: `El rol de "${nombreUsuario}" fue cambiado a "${nuevoRol}".`,
      });
      // Actualizar localmente de inmediato para UX instantánea
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, rol: nuevoRol } : u))
      );
      // Recargar estadísticas
      cargarUsuarios();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el rol.");
    } finally {
      setActualizandoId(null);
      setTimeout(() => setNotificacion(null), 4000);
    }
  };

  // Confirmar eliminación
  const handleConfirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    setEliminando(true);
    setError("");
    try {
      await deleteAdminUser(usuarioAEliminar.id);
      setNotificacion({
        tipo: "exito",
        mensaje: `Usuario "${usuarioAEliminar.nombre}" eliminado exitosamente.`,
      });
      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioAEliminar.id));
      setUsuarioAEliminar(null);
      cargarUsuarios();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el usuario.");
    } finally {
      setEliminando(false);
      setTimeout(() => setNotificacion(null), 4000);
    }
  };

  const formatearFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(fecha);
    } catch {
      return fechaStr;
    }
  };

  const badgeRol = (rol) => {
    switch (rol) {
      case "administrador":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "operador":
        return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
      case "usuario":
      default:
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner de bienvenida y alcance del módulo */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--s-action)] font-semibold">
            Sprint 3 · Gestión de Cuentas
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--s-fg)]">
            Registro y Roles de Usuarios
          </h1>
          <p className="mt-1 text-sm text-[var(--s-fg)]/70 max-w-2xl">
            Control centralizado para auditar usuarios registrados, asignar permisos de
            Operador o Administrador, y aislar los privilegios en la plataforma.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => cargarUsuarios()}
          disabled={cargando}
          magnetic={false}
          className="self-start md:self-auto text-xs"
        >
          {cargando ? "Actualizando…" : "↻ Recargar datos"}
        </Button>
      </div>

      {/* Notificación flotante de feedback */}
      {notificacion && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 transition-all shadow-sm"
        >
          <span className="text-base">✓</span>
          <span>{notificacion.mensaje}</span>
        </div>
      )}

      {/* Banner de error */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400 transition-all"
        >
          <span className="text-base">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas de métricas rápidas (KPIs) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        <Section surface="card" className="rounded-2xl p-4 md:p-5 border border-[var(--s-border)] shadow-sm">
          <p className="font-mono text-xs uppercase text-[var(--s-fg)]/60 font-medium">Total Registrados</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--s-fg)]">
            {estadisticas?.total ?? usuarios.length}
          </p>
          <p className="mt-1 text-[11px] text-[var(--s-fg)]/60">Cuentas activas en Quokka</p>
        </Section>

        <Section surface="card" className="rounded-2xl p-4 md:p-5 border border-[var(--s-border)] shadow-sm">
          <p className="font-mono text-xs uppercase text-rose-500 dark:text-rose-400 font-medium">Administradores</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--s-fg)]">
            {estadisticas?.administradores ?? usuarios.filter((u) => u.rol === "administrador").length}
          </p>
          <p className="mt-1 text-[11px] text-[var(--s-fg)]/60">Acceso total a paneles</p>
        </Section>

        <Section surface="card" className="rounded-2xl p-4 md:p-5 border border-[var(--s-border)] shadow-sm">
          <p className="font-mono text-xs uppercase text-cyan-600 dark:text-cyan-400 font-medium">Operadores</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--s-fg)]">
            {estadisticas?.operadores ?? usuarios.filter((u) => u.rol === "operador").length}
          </p>
          <p className="mt-1 text-[11px] text-[var(--s-fg)]/60">Atención de mensajes</p>
        </Section>

        <Section surface="card" className="rounded-2xl p-4 md:p-5 border border-[var(--s-border)] shadow-sm">
          <p className="font-mono text-xs uppercase text-amber-600 dark:text-amber-400 font-medium">Usuarios</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--s-fg)]">
            {estadisticas?.usuarios ?? usuarios.filter((u) => u.rol === "usuario").length}
          </p>
          <p className="mt-1 text-[11px] text-[var(--s-fg)]/60">Visualizan demos</p>
        </Section>
      </div>

      {/* Barra de filtros y búsqueda */}
      <Section surface="card" className="rounded-2xl p-4 md:p-6 border border-[var(--s-border)] space-y-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--s-fg)]/40 select-none">
              🔍
            </span>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => {
                const val = e.target.value;
                startTransition(() => setBusqueda(val));
              }}
              placeholder="Buscar por nombre o correo electrónico…"
              className="w-full rounded-full border border-[var(--s-border)] bg-[var(--s-bg)] py-2.5 pl-10 pr-4 text-sm text-[var(--s-fg)] placeholder-[var(--s-fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--s-action)] transition-all"
            />
          </div>

          {/* Filtros por rol */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono uppercase text-[var(--s-fg)]/60 mr-1">Filtrar:</span>
            {[
              { id: "todos", label: "Todos" },
              { id: "administrador", label: "Admin" },
              { id: "operador", label: "Operador" },
              { id: "usuario", label: "Usuario" },
            ].map(({ id, label }) => {
              const activo = filtroRol === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFiltroRol(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
                    activo
                      ? "bg-[var(--s-action)] text-[var(--s-on-action)] border-[var(--s-action)] shadow-sm"
                      : "bg-[var(--s-bg)] text-[var(--s-fg)]/70 border-[var(--s-border)] hover:bg-[var(--s-action)]/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabla responsive en desktop */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--s-border)]">
          <table className="w-full text-left text-sm text-[var(--s-fg)]">
            <thead className="border-b border-[var(--s-border)] bg-[var(--s-bg)]/60 text-xs font-mono uppercase text-[var(--s-fg)]/60">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Método</th>
                <th className="px-4 py-3 font-semibold">Rol Actual</th>
                <th className="px-4 py-3 font-semibold">Fecha Registro</th>
                <th className="px-4 py-3 font-semibold text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--s-border)] bg-[var(--s-bg)]">
              {cargando && usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[var(--s-fg)]/60">
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Cargando usuarios registrados…
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[var(--s-fg)]/60">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                usuarios.map((user) => {
                  const esAdminActual = adminUsuario && adminUsuario.id === user.id;
                  const guardando = actualizandoId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[var(--s-card)]/50 transition-colors"
                    >
                      {/* ID */}
                      <td className="px-4 py-3.5 font-mono text-xs text-[var(--s-fg)]/50">
                        #{user.id}
                      </td>

                      {/* Usuario */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--s-action)]/15 text-[var(--s-action)] font-display font-bold text-xs uppercase border border-[var(--s-action)]/30">
                            {user.nombre?.slice(0, 2) || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {user.nombre}
                              {esAdminActual && (
                                <span className="ml-2 text-[10px] font-mono uppercase text-[var(--s-action)] bg-[var(--s-action)]/10 px-2 py-0.5 rounded-full border border-[var(--s-action)]/20">
                                  Tú
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-[var(--s-fg)]/60 font-mono truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Método */}
                      <td className="px-4 py-3.5">
                        {user.es_google ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--s-fg)]/70 font-medium">
                            <span className="size-2 rounded-full bg-blue-500" />
                            Google
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--s-fg)]/70 font-medium">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Contraseña
                          </span>
                        )}
                      </td>

                      {/* Rol con Badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono uppercase font-semibold border ${badgeRol(
                            user.rol
                          )}`}
                        >
                          {user.rol}
                        </span>
                      </td>

                      {/* Fecha de Registro */}
                      <td className="px-4 py-3.5 text-xs font-mono text-[var(--s-fg)]/70">
                        {formatearFecha(user.fecha_creacion)}
                      </td>

                      {/* Acciones de Gestión */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Selector de Rol */}
                          <div className="relative inline-block">
                            <select
                              value={user.rol}
                              disabled={guardando}
                              onChange={(e) =>
                                handleCambiarRol(
                                  user.id,
                                  e.target.value,
                                  user.nombre
                                )
                              }
                              className="rounded-lg border border-[var(--s-border)] bg-[var(--s-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--s-fg)] focus:outline-none focus:ring-1 focus:ring-[var(--s-action)] disabled:opacity-50 cursor-pointer"
                              title="Cambiar rol"
                            >
                              <option value="usuario">Usuario</option>
                              <option value="operador">Operador</option>
                              <option value="administrador">Administrador</option>
                            </select>
                            {guardando && (
                              <span className="absolute right-1 top-1 text-[10px]">
                                ⏳
                              </span>
                            )}
                          </div>

                          {/* Botón Eliminar */}
                          {!esAdminActual && (
                            <button
                              type="button"
                              onClick={() => setUsuarioAEliminar(user)}
                              className="rounded-lg border border-rose-500/30 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 transition-colors"
                              title="Eliminar usuario"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Tarjetas adaptables en móviles */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {cargando && usuarios.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--s-fg)]/60">
              Cargando usuarios…
            </p>
          ) : usuarios.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--s-fg)]/60">
              No hay usuarios que coincidan.
            </p>
          ) : (
            usuarios.map((user) => {
              const esAdminActual = adminUsuario && adminUsuario.id === user.id;
              const guardando = actualizandoId === user.id;

              return (
                <div
                  key={user.id}
                  className="rounded-xl border border-[var(--s-border)] bg-[var(--s-bg)] p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-full bg-[var(--s-action)]/15 text-[var(--s-action)] font-display font-bold text-xs uppercase border border-[var(--s-action)]/30">
                        {user.nombre?.slice(0, 2) || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {user.nombre}
                          {esAdminActual && (
                            <span className="ml-1 text-[10px] text-[var(--s-action)]">
                              (Tú)
                            </span>
                          )}
                        </p>
                        <p className="text-xs font-mono text-[var(--s-fg)]/60 truncate max-w-[200px]">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${badgeRol(
                        user.rol
                      )}`}
                    >
                      {user.rol}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--s-fg)]/60 pt-2 border-t border-[var(--s-border)]">
                    <span className="font-mono text-[11px]">
                      {formatearFecha(user.fecha_creacion)}
                    </span>
                    <span>{user.es_google ? "Google" : "Email"}</span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[var(--s-fg)]/70">Rol:</label>
                      <select
                        value={user.rol}
                        disabled={guardando}
                        onChange={(e) =>
                          handleCambiarRol(user.id, e.target.value, user.nombre)
                        }
                        className="rounded border border-[var(--s-border)] bg-[var(--s-card)] px-2 py-1 text-xs text-[var(--s-fg)]"
                      >
                        <option value="usuario">Usuario</option>
                        <option value="operador">Operador</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </div>

                    {!esAdminActual && (
                      <button
                        type="button"
                        onClick={() => setUsuarioAEliminar(user)}
                        className="text-xs text-rose-500 hover:underline px-2 py-1"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Section>

      {/* Modal de confirmación de eliminación */}
      {usuarioAEliminar && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg)] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <span className="text-2xl">⚠</span>
              <h3 className="font-display text-lg font-bold text-[var(--s-fg)]">
                Confirmar eliminación
              </h3>
            </div>

            <p className="text-sm text-[var(--s-fg)]/80 leading-relaxed">
              ¿Estás seguro de que querés eliminar la cuenta de{" "}
              <strong className="text-[var(--s-fg)]">{usuarioAEliminar.nombre}</strong> (
              <span className="font-mono text-xs">{usuarioAEliminar.email}</span>)?
              Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setUsuarioAEliminar(null)}
                disabled={eliminando}
                magnetic={false}
              >
                Cancelar
              </Button>

              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={eliminando}
                className="rounded-[2rem] px-4 py-2 text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {eliminando ? "Eliminando…" : "Sí, eliminar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
