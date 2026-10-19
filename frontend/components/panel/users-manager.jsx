"use client";

import { useRef, useState } from "react";
import { RefreshCw, Shield, Trash2 } from "lucide-react";
import Section from "@/components/layout/section";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import usePanelResource from "@/hooks/use-panel-resource";
import useAuth from "@/hooks/use-auth";
import { deleteUser, updateUserRole } from "@/lib/panel-api";
import { Feedback, PanelDialog, PanelHeading, ResourceState } from "./panel-shared";

const ROLE_LABELS = {
  usuario: "Usuario registrado",
  operador: "Operador",
  administrador: "Administrador",
};

const formatDate = value =>
  value
    ? new Date(value).toLocaleString("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Argentina/Buenos_Aires",
      })
    : "—";

export default function UsersManager() {
  const resource = usePanelResource("/api/admin/usuarios");
  const { mounted, user: currentUser, isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [updatingId, setUpdatingId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const canModifyUsers = !mounted || isAdmin;

  const records = resource.data.filter(user => {
    const matchesRole = roleFilter === "todos" || user.rol === roleFilter;
    const query = search.trim().toLocaleLowerCase("es");
    const matchesSearch =
      !query ||
      `${user.nombre || ""} ${user.email || ""} ${user.rol || ""}`
        .toLocaleLowerCase("es")
        .includes(query);
    return matchesRole && matchesSearch;
  });

  async function handleRoleChange(user, nuevoRol) {
    if (!canModifyUsers || !nuevoRol || nuevoRol === user.rol || updatingId !== null) return;
    setUpdatingId(user.id);
    setFeedback(null);
    try {
      await updateUserRole(user.id, nuevoRol);
      setFeedback({
        text: `Rol de ${user.nombre} actualizado a ${ROLE_LABELS[nuevoRol] || nuevoRol}.`,
      });
      resource.reload();
    } catch (failure) {
      setFeedback({
        error: true,
        text: failure.message || "No se pudo actualizar el rol del usuario.",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  return <>
    <PanelHeading
      eyebrow="Permisos y cuentas del estudio"
      title="Usuarios"
      description="Administrá las cuentas registradas en Quokka y asigná permisos de usuario, operador o administrador."
    >
      <Button
        size="sm"
        variant="secondary"
        magnetic={false}
        iconLeft={<RefreshCw size={17} />}
        disabled={resource.loading || updatingId !== null}
        onClick={resource.reload}
      >
        Actualizar
      </Button>
    </PanelHeading>

    {mounted && !isAdmin && (
      <div className="panel-inline-notice" role="status">
        <p>Modo solo lectura (Operador): Solo un Administrador puede modificar roles o eliminar cuentas registradas.</p>
      </div>
    )}

    <Feedback message={feedback} />

    <div className="panel-filters">
      <Select
        label="Filtrar por rol"
        value={roleFilter}
        disabled={updatingId !== null}
        onValueChange={value => {
          setRoleFilter(value);
          setFeedback(null);
        }}
      >
        <option value="todos">Todos los roles</option>
        <option value="usuario">Usuarios registrados</option>
        <option value="operador">Operadores</option>
        <option value="administrador">Administradores</option>
      </Select>
    </div>

    <Section className="panel-sheet" surface="card" aria-label="Listado de usuarios">
      <div className="panel-list-toolbar">
        <div>
          <h3>Cuentas registradas</h3>
          <p>
            {resource.loading
              ? "Cargando usuarios"
              : resource.error
                ? "Sin conexión"
                : `${resource.data.length} ${resource.data.length === 1 ? "usuario registrado" : "usuarios registrados"}`}
          </p>
        </div>
        <Input
          wrapperClassName="panel-search"
          type="search"
          label="Buscar por nombre o correo"
          icon={false}
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </div>

      <ResourceState resource={resource} empty="Todavía no hay usuarios registrados">
        {!records.length ? (
          <p className="panel-state">No hay usuarios que coincidan con la búsqueda.</p>
        ) : (
          <ul className="panel-records">
            {records.map((user, index) => {
              const isOwnAccount = mounted && currentUser && Number(currentUser.id) === Number(user.id);
              return (
                <li key={user.id} className="panel-record">
                  <span className="panel-record-index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="panel-record-copy">
                    <h3>
                      {user.nombre} {isOwnAccount ? "(Vos)" : ""}
                    </h3>
                    <p>{user.email}</p>
                    <ul className="panel-tags" aria-label="Detalles de la cuenta">
                      <li>
                        <Shield size={12} aria-hidden="true" style={{ display: "inline", marginRight: 4 }} />
                        {ROLE_LABELS[user.rol] || user.rol}
                      </li>
                      <li>{user.google_id ? "Google OAuth" : "Registro local"}</li>
                      <li>Alta: {formatDate(user.fecha_creacion)}</li>
                    </ul>
                  </div>
                  <div className="panel-record-actions" style={{ alignItems: "end", gap: 12 }}>
                    <div style={{ minWidth: 200 }}>
                      <Select
                        label={`Rol de ${user.nombre}`}
                        value={user.rol}
                        disabled={!canModifyUsers || updatingId === user.id}
                        onValueChange={nuevoRol => handleRoleChange(user, nuevoRol)}
                      >
                        <option value="usuario">Usuario</option>
                        <option value="operador">Operador</option>
                        <option value="administrador">Administrador</option>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      magnetic={false}
                      className="panel-icon-button"
                      aria-label={`Eliminar ${user.nombre}`}
                      title={
                        !canModifyUsers
                          ? "Solo un administrador puede eliminar usuarios"
                          : isOwnAccount
                            ? "No podés eliminar tu propia cuenta activa"
                            : `Eliminar ${user.nombre}`
                      }
                      disabled={!canModifyUsers || isOwnAccount || updatingId === user.id}
                      onClick={() => {
                        setFeedback(null);
                        setUserToDelete(user);
                      }}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ResourceState>
    </Section>

    {userToDelete && (
      <DeleteUserDialog
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onDeleted={text => {
          setUserToDelete(null);
          setFeedback({ text });
          resource.reload();
        }}
      />
    )}
  </>;
}

function DeleteUserDialog({ user, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const lock = useRef(false);

  async function confirmDelete(event) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      await deleteUser(user.id);
      onDeleted(`El usuario ${user.nombre} (${user.email}) fue eliminado correctamente.`);
    } catch (failure) {
      setError({
        error: true,
        text: failure.message || "No se pudo eliminar el usuario. Intentá nuevamente.",
      });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <PanelDialog title="Eliminar usuario" onClose={onClose} busy={busy}>
      <form className="panel-form" onSubmit={confirmDelete}>
        <fieldset disabled={busy} className="panel-form-fields">
          <div className="panel-delete-copy">
            <p>
              Vas a eliminar la cuenta de <strong>{user.nombre}</strong> ({user.email}).
            </p>
            <p>
              El usuario perderá el acceso inmediatamente. Esta acción no se puede deshacer.
            </p>
          </div>
        </fieldset>
        <Feedback message={error} />
        <div className="panel-form-actions">
          <Button size="sm" variant="ghost" magnetic={false} disabled={busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" type="submit" magnetic={false} loading={busy} loadingLabel="Eliminando…">
            Sí, eliminar
          </Button>
        </div>
      </form>
    </PanelDialog>
  );
}
