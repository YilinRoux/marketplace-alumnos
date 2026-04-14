"use client";

import { useState, useMemo, useCallback } from "react";
import { Package } from "lucide-react";
import DataTable, { Column, Action } from "../components/DataTable";
import SearchFilter from "../components/SearchFilter";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import { mockProducts, MockProduct } from "../_mock/mockData";
import styles from "./page.module.css";

type ConfirmAction = {
  type: "activate" | "deactivate" | "review" | "delete";
  product: MockProduct;
} | null;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<MockProduct[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.seller.toLowerCase().includes(search.toLowerCase());

      const matchStatus = !filters.status || p.status === filters.status;

      return matchSearch && matchStatus;
    });
  }, [products, search, filters]);

  const handleToggleStatus = (product: MockProduct) => {
    setConfirmAction({
      type: product.status === "active" ? "deactivate" : "activate",
      product,
    });
  };

  const handleReview = (product: MockProduct) => {
    setConfirmAction({ type: "review", product });
  };

  const handleDelete = (product: MockProduct) => {
    setConfirmAction({ type: "delete", product });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    const { type, product } = confirmAction;

    if (type === "activate" || type === "deactivate") {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, status: type === "activate" ? "active" : "inactive" }
            : p
        )
      );
      showToast(
        `"${product.title}" ha sido ${type === "activate" ? "activada" : "desactivada"}`
      );
    } else if (type === "review") {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, status: "reviewed" } : p
        )
      );
      showToast(`"${product.title}" marcada como revisada`);
    } else if (type === "delete") {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, status: "deleted" } : p
        )
      );
      showToast(`"${product.title}" ha sido eliminada`);
    }

    setConfirmAction(null);
  };

  const columns: Column<MockProduct>[] = [
    {
      key: "title",
      label: "Publicación",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <span className={styles.productTitle}>{row.title}</span>
          <span className={styles.productSeller}>{row.seller}</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Precio",
      sortable: true,
      render: (row) => (
        <span className={styles.price}>
          ${row.price.toLocaleString("es-MX")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} type="product" />,
    },
    {
      key: "createdAt",
      label: "Fecha",
      sortable: true,
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  const actions: Action<MockProduct>[] = [
    {
      label: "Desactivar",
      onClick: handleToggleStatus,
      variant: "warning",
      show: (row) => row.status === "active",
    },
    {
      label: "Activar",
      onClick: handleToggleStatus,
      variant: "success",
      show: (row) =>
        row.status === "inactive" || row.status === "reported",
    },
    {
      label: "Revisada",
      onClick: handleReview,
      variant: "success",
      show: (row) =>
        row.status === "reported" || row.status === "active",
    },
    {
      label: "Eliminar",
      onClick: handleDelete,
      variant: "danger",
      show: (row) => row.status !== "deleted",
    },
  ];

  const getDialogConfig = () => {
    if (!confirmAction) return null;
    const { type, product } = confirmAction;

    switch (type) {
      case "deactivate":
        return {
          title: "Desactivar publicación",
          message: `¿Desactivar "${product.title}"? No será visible en el marketplace.`,
          variant: "warning" as const,
          confirmLabel: "Desactivar",
        };
      case "activate":
        return {
          title: "Activar publicación",
          message: `¿Reactivar "${product.title}"? Será visible nuevamente en el marketplace.`,
          variant: "info" as const,
          confirmLabel: "Activar",
        };
      case "review":
        return {
          title: "Marcar como revisada",
          message: `¿Marcar "${product.title}" como revisada? Se eliminará su estado de reporte.`,
          variant: "info" as const,
          confirmLabel: "Marcar revisada",
        };
      case "delete":
        return {
          title: "Eliminar publicación",
          message: `¿Eliminar "${product.title}"? Esta acción cambiará su estado a eliminado.`,
          variant: "danger" as const,
          confirmLabel: "Eliminar",
        };
    }
  };

  const dialogConfig = getDialogConfig();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Gestión de Publicaciones</h2>
          <p className={styles.pageSubtitle}>
            Administra todas las publicaciones del marketplace
          </p>
        </div>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por título o vendedor..."
        filters={[
          {
            key: "status",
            label: "Todos los estados",
            options: [
              { label: "Activo", value: "active" },
              { label: "Inactivo", value: "inactive" },
              { label: "Reportado", value: "reported" },
              { label: "Revisado", value: "reviewed" },
              { label: "Eliminado", value: "deleted" },
            ],
          },
        ]}
        filterValues={filters}
        onFilterChange={(key, val) =>
          setFilters((prev) => ({ ...prev, [key]: val }))
        }
        resultCount={filteredProducts.length}
      />

      <DataTable
        columns={columns}
        data={filteredProducts}
        actions={actions}
        emptyMessage="No se encontraron publicaciones con estos filtros"
        emptyIcon={<Package size={32} />}
      />

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

      {toast && <div className={styles.toast}>{toast}</div>}
    </>
  );
}
