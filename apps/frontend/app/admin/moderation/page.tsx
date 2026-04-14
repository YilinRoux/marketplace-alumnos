"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Flag,
  Store,
  User,
  Calendar,
  CheckCircle,
  Trash2,
  XCircle,
  CircleCheck,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { mockReports, MockReport } from "../_mock/mockData";
import styles from "./page.module.css";

type TabFilter = "all" | "pending" | "resolved" | "dismissed";

type ConfirmAction = {
  type: "approve" | "remove" | "dismiss";
  report: MockReport;
} | null;

export default function AdminModerationPage() {
  const [reports, setReports] = useState<MockReport[]>(mockReports);
  const [activeTab, setActiveTab] = useState<TabFilter>("pending");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filteredReports = useMemo(() => {
    if (activeTab === "all") return reports;
    return reports.filter((r) => r.status === activeTab);
  }, [reports, activeTab]);

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const handleApprove = (report: MockReport) => {
    setConfirmAction({ type: "approve", report });
  };

  const handleRemove = (report: MockReport) => {
    setConfirmAction({ type: "remove", report });
  };

  const handleDismiss = (report: MockReport) => {
    setConfirmAction({ type: "dismiss", report });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    const { type, report } = confirmAction;

    if (type === "approve") {
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id ? { ...r, status: "resolved" } : r
        )
      );
      showToast(`Reporte de "${report.productTitle}" aprobado, publicación mantenida`);
    } else if (type === "remove") {
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id ? { ...r, status: "resolved" } : r
        )
      );
      showToast(`Publicación "${report.productTitle}" eliminada`);
    } else if (type === "dismiss") {
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id ? { ...r, status: "dismissed" } : r
        )
      );
      showToast(`Reporte de "${report.productTitle}" descartado`);
    }

    setConfirmAction(null);
  };

  const getDialogConfig = () => {
    if (!confirmAction) return null;
    const { type, report } = confirmAction;

    switch (type) {
      case "approve":
        return {
          title: "Aprobar publicación",
          message: `¿Aprobar la publicación "${report.productTitle}"? El reporte se marcará como resuelto y la publicación se mantendrá activa.`,
          variant: "info" as const,
          confirmLabel: "Aprobar",
        };
      case "remove":
        return {
          title: "Eliminar publicación",
          message: `¿Eliminar la publicación "${report.productTitle}"? Esta acción removerá la publicación del marketplace.`,
          variant: "danger" as const,
          confirmLabel: "Eliminar publicación",
        };
      case "dismiss":
        return {
          title: "Descartar reporte",
          message: `¿Descartar este reporte sobre "${report.productTitle}"? El reporte no será considerado.`,
          variant: "warning" as const,
          confirmLabel: "Descartar",
        };
    }
  };

  const dialogConfig = getDialogConfig();

  const tabs: { key: TabFilter; label: string; count?: number }[] = [
    { key: "pending", label: "Pendientes", count: pendingCount },
    { key: "resolved", label: "Resueltos" },
    { key: "dismissed", label: "Descartados" },
    { key: "all", label: "Todos" },
  ];

  return (
    <>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Moderación</h2>
          <p className={styles.pageSubtitle}>
            Revisa y gestiona las publicaciones reportadas
          </p>
        </div>
        {pendingCount > 0 && (
          <div className={styles.pendingCount}>
            <Flag size={16} /> {pendingCount} reporte{pendingCount !== 1 ? "s" : ""} pendiente{pendingCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && ` (${tab.count})`}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={<CircleCheck size={40} />}
            title={
              activeTab === "pending"
                ? "No hay reportes pendientes"
                : "No hay reportes en esta categoría"
            }
            description="Todos los reportes han sido revisados."
          />
        </div>
      ) : (
        <div className={styles.reportsList}>
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`${styles.reportCard} ${
                report.status === "resolved"
                  ? styles.reportCardResolved
                  : report.status === "dismissed"
                    ? styles.reportCardDismissed
                    : ""
              }`}
            >
              {/* Header */}
              <div className={styles.reportHeader}>
                <div>
                  <h3 className={styles.reportProduct}>
                    {report.productTitle}
                  </h3>
                  <div className={styles.reportMeta}>
                    <span className={styles.reportMetaItem}>
                      <Store size={13} /> Vendedor: <strong>{report.seller}</strong>
                    </span>
                    <span className={styles.reportMetaItem}>
                      <User size={13} /> Reportado por: <strong>{report.reportedBy}</strong>
                    </span>
                    <span className={styles.reportMetaItem}>
                      <Calendar size={13} />{" "}
                      {new Date(report.createdAt).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <StatusBadge status={report.status} type="report" />
              </div>

              {/* Reason */}
              <div className={styles.reportReason}>
                <span className={styles.reportReasonLabel}>
                  Razón del reporte
                </span>
                {report.reason}
              </div>

              {/* Actions */}
              {report.status === "pending" && (
                <div className={styles.reportActions}>
                  <button
                    className={styles.btnApprove}
                    onClick={() => handleApprove(report)}
                  >
                    <CheckCircle size={14} /> Aprobar publicación
                  </button>
                  <button
                    className={styles.btnRemove}
                    onClick={() => handleRemove(report)}
                  >
                    <Trash2 size={14} /> Eliminar publicación
                  </button>
                  <button
                    className={styles.btnDismiss}
                    onClick={() => handleDismiss(report)}
                  >
                    <XCircle size={14} /> Descartar reporte
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
