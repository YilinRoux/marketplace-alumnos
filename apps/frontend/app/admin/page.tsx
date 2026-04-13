"use client";

import Link from "next/link";
import {
  Users,
  Store,
  Package,
  Flag,
  ClipboardList,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import KPICard from "./components/KPICard";
import StatusBadge from "./components/StatusBadge";
import { mockStats, mockProducts, mockReports } from "./_mock/mockData";
import styles from "./page.module.css";

const recentReports = mockReports
  .filter((r) => r.status === "pending")
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 5);

const recentProducts = mockProducts
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 5);

export default function AdminOverviewPage() {
  return (
    <>
      <h2 className={styles.pageTitle}>Vista General</h2>
      <p className={styles.pageSubtitle}>
        Resumen de actividad y métricas del marketplace
      </p>

      {/* ─── KPI Cards ───────────────────────── */}
      <div className={styles.kpiGrid}>
        <KPICard
          title="Total Usuarios"
          value={mockStats.totalUsers}
          icon={Users}
          color="blue"
          trend={{ value: "+12 este mes", direction: "up" }}
        />
        <KPICard
          title="Sellers Activos"
          value={mockStats.activeSellers}
          icon={Store}
          color="green"
          trend={{ value: "+3 esta semana", direction: "up" }}
        />
        <KPICard
          title="Publicaciones"
          value={mockStats.totalProducts}
          icon={Package}
          color="purple"
          trend={{ value: "+28 este mes", direction: "up" }}
        />
        <KPICard
          title="Reportadas"
          value={mockStats.reportedProducts}
          icon={Flag}
          color={mockStats.reportedProducts > 5 ? "red" : "orange"}
          trend={{ value: "2 nuevos", direction: "up" }}
        />
      </div>

      {/* ─── Quick Actions ───────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <ClipboardList size={18} /> Acciones Rápidas
          </h3>
        </div>
        <div className={styles.quickActions}>
          <Link href="/admin/users" className={styles.actionCard}>
            <span className={styles.actionIcon}><Users size={18} /></span>
            Gestionar Usuarios
          </Link>
          <Link href="/admin/products" className={styles.actionCard}>
            <span className={styles.actionIcon}><Package size={18} /></span>
            Ver Publicaciones
          </Link>
          <Link href="/admin/moderation" className={styles.actionCard}>
            <span className={styles.actionIcon}><Flag size={18} /></span>
            Revisar Reportes ({recentReports.length})
          </Link>
        </div>
      </div>

      {/* ─── Recent Activity ─────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <ClipboardList size={18} /> Publicaciones Recientes
          </h3>
          <Link href="/admin/products" className={styles.actionCard} style={{ padding: "8px 16px", marginBottom: 0 }}>
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Seller</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {recentProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                <td>{product.seller}</td>
                <td>
                  <StatusBadge status={product.status} type="product" />
                </td>
                <td>
                  {new Date(product.createdAt).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Charts Placeholder ──────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <BarChart3 size={18} /> Estadísticas
          </h3>
        </div>
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}><BarChart3 size={36} /></span>
          <span className={styles.placeholderText}>
            Las gráficas de estadísticas avanzadas estarán disponibles próximamente.
          </span>
        </div>
      </div>
    </>
  );
}
