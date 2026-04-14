"use client";

import { useState, useMemo, useCallback } from "react";
import { Users } from "lucide-react";
import DataTable, { Column, Action } from "../components/DataTable";
import SearchFilter from "../components/SearchFilter";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import { mockUsers, MockUser } from "../_mock/mockData";
import styles from "./page.module.css";

type ConfirmAction = {
  type: "block" | "unblock" | "delete" | "changeRole";
  user: MockUser;
  newRole?: string;
} | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Toast helper
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Filter data
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchRole = !filters.role || u.role === filters.role;
      const matchStatus = !filters.status || u.status === filters.status;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, filters]);

  // Handlers
  const handleBlock = (user: MockUser) => {
    setConfirmAction({
      type: user.status === "active" ? "block" : "unblock",
      user,
    });
  };

  const handleDelete = (user: MockUser) => {
    setConfirmAction({ type: "delete", user });
  };

  const handleRoleChange = (user: MockUser, newRole: string) => {
    setConfirmAction({ type: "changeRole", user, newRole });
  };

  const executeAction = () => {
    if (!confirmAction) return;

    const { type, user } = confirmAction;

    if (type === "block" || type === "unblock") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: type === "block" ? "blocked" : "active" }
            : u
        )
      );
      showToast(
        `${user.name} ha sido ${type === "block" ? "bloqueado" : "desbloqueado"}`
      );
    } else if (type === "delete") {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showToast(`${user.name} ha sido eliminado`);
    } else if (type === "changeRole" && confirmAction.newRole) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, role: confirmAction.newRole as MockUser["role"] }
            : u
        )
      );
      showToast(`Rol de ${user.name} cambiado a ${confirmAction.newRole}`);
    }

    setConfirmAction(null);
  };

  // Table columns
  const columns: Column<MockUser>[] = [
    {
      key: "name",
      label: "Usuario",
      sortable: true,
      render: (row) => (
        <div className={styles.userCell}>
          <div className={styles.userAvatar}>
            {row.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className={styles.userName}>{row.name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rol",
      sortable: true,
      render: (row) => (
        <select
          className={styles.roleSelect}
          value={row.role}
          onChange={(e) => handleRoleChange(row, e.target.value)}
          disabled={row.role === "superadmin"}
          aria-label={`Cambiar rol de ${row.name}`}
        >
          <option value="user">Usuario</option>
          <option value="seller">Vendedor</option>
          <option value="superadmin">Superadmin</option>
        </select>
      ),
    },
    {
      key: "status",
      label: "Estado",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} type="user" />,
    },
    {
      key: "createdAt",
      label: "Registro",
      sortable: true,
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  // Table actions
  const actions: Action<MockUser>[] = [
    {
      label: "Bloquear",
      onClick: handleBlock,
      variant: "warning",
      show: (row) => row.status === "active" && row.role !== "superadmin",
    },
    {
      label: "Desbloquear",
      onClick: handleBlock,
      variant: "success",
      show: (row) => row.status === "blocked",
    },
    {
      label: "Eliminar",
      onClick: handleDelete,
      variant: "danger",
      show: (row) => row.role !== "superadmin",
    },
  ];

  // Confirm dialog config
  const getDialogConfig = () => {
    if (!confirmAction) return null;

    const { type, user } = confirmAction;

    switch (type) {
      case "block":
        return {
          title: "Bloquear usuario",
          message: `¿Estás seguro de bloquear a "${user.name}"? El usuario no podrá acceder al marketplace.`,
          variant: "warning" as const,
          confirmLabel: "Bloquear",
        };
      case "unblock":
        return {
          title: "Desbloquear usuario",
          message: `¿Deseas desbloquear a "${user.name}"? El usuario recuperará su acceso.`,
          variant: "info" as const,
          confirmLabel: "Desbloquear",
        };
      case "delete":
        return {
          title: "Eliminar usuario",
          message: `¿Eliminar permanentemente a "${user.name}"? Esta acción no se puede deshacer.`,
          variant: "danger" as const,
          confirmLabel: "Eliminar",
        };
      case "changeRole":
        return {
          title: "Cambiar rol",
          message: `¿Cambiar el rol de "${user.name}" a "${confirmAction.newRole}"?`,
          variant: "warning" as const,
          confirmLabel: "Cambiar rol",
        };
    }
  };

  const dialogConfig = getDialogConfig();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Gestión de Usuarios</h2>
          <p className={styles.pageSubtitle}>
            Administra los usuarios registrados en el marketplace
          </p>
        </div>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o email..."
        filters={[
          {
            key: "role",
            label: "Todos los roles",
            options: [
              { label: "Usuario", value: "user" },
              { label: "Vendedor", value: "seller" },
              { label: "Superadmin", value: "superadmin" },
            ],
          },
          {
            key: "status",
            label: "Todos los estados",
            options: [
              { label: "Activo", value: "active" },
              { label: "Bloqueado", value: "blocked" },
            ],
          },
        ]}
        filterValues={filters}
        onFilterChange={(key, val) =>
          setFilters((prev) => ({ ...prev, [key]: val }))
        }
        resultCount={filteredUsers.length}
      />

      <DataTable
        columns={columns}
        data={filteredUsers}
        actions={actions}
        emptyMessage="No se encontraron usuarios con estos filtros"
        emptyIcon={<Users size={32} />}
      />

      {/* Confirm Dialog */}
      {confirmAction && dialogConfig && (
        <ConfirmDialog
          title={dialogConfig.title}
          message={dialogConfig.message}
          variant={dialogConfig.variant}
          confirmLabel={dialogConfig.confirmLabel}
          onConfirm={executeAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}
    </>
  );
}
