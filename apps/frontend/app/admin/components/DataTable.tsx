"use client";

import { useState, useMemo } from "react";
import { Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./DataTable.module.css";

// ─── Types ──────────────────────────────────────

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

export interface Action<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "danger" | "success" | "warning";
  show?: (row: T) => boolean;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

// ─── Component ──────────────────────────────────

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  actions,
  pageSize = 8,
  loading = false,
  emptyMessage = "No se encontraron resultados",
  emptyIcon,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Reset page when data changes
  useMemo(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal == null || bVal == null) return 0;

      let cmp = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        cmp = aVal.localeCompare(bVal, "es");
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), "es");
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const totalColumns = columns.length + (actions ? 1 : 0);

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.sortable ? styles.sortable : ""}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className={styles.sortIndicator}>
                      {sortDir === "asc" ? " ▲" : " ▼"}
                    </span>
                  )}
                </th>
              ))}
              {actions && <th style={{ textAlign: "right" }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {/* Loading skeleton */}
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className={styles.skeletonRow}>
                  {Array.from({ length: totalColumns }).map((_, j) => (
                    <td key={j}>
                      <div
                        className={styles.skeletonCell}
                        style={{ width: `${60 + Math.random() * 40}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Empty state */}
            {!loading && paginatedData.length === 0 && (
              <tr className={styles.emptyRow}>
                <td colSpan={totalColumns}>
                  <span className={styles.emptyIcon}>{emptyIcon || <Inbox size={32} />}</span>
                  {emptyMessage}
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading &&
              paginatedData.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div className={styles.actionsCell}>
                        {actions
                          .filter((action) => !action.show || action.show(row))
                          .map((action, i) => {
                            const variantClass =
                              action.variant === "danger"
                                ? styles.actionBtnDanger
                                : action.variant === "success"
                                  ? styles.actionBtnSuccess
                                  : action.variant === "warning"
                                    ? styles.actionBtnWarning
                                    : "";
                            return (
                              <button
                                key={i}
                                className={`${styles.actionBtn} ${variantClass}`}
                                onClick={() => action.onClick(row)}
                              >
                                {action.label}
                              </button>
                            );
                          })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && sortedData.length > pageSize && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Mostrando {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sortedData.length)} de{" "}
            {sortedData.length}
          </span>
          <div className={styles.pageButtons}>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 1
              )
              .map((p, i, arr) => {
                const nodes: React.ReactNode[] = [];
                if (i > 0 && arr[i - 1] !== p - 1) {
                  nodes.push(
                    <span key={`dots-${p}`} className={styles.pageInfo}>
                      …
                    </span>
                  );
                }
                nodes.push(
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                );
                return nodes;
              })}
            <button
              className={styles.pageBtn}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
