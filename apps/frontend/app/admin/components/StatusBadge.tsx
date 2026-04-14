import styles from "./StatusBadge.module.css";

type BadgeType = "user" | "product" | "report" | "role";

interface StatusBadgeProps {
  status: string;
  type?: BadgeType;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  blocked: "Bloqueado",
  inactive: "Inactivo",
  reported: "Reportado",
  deleted: "Eliminado",
  reviewed: "Revisado",
  pending: "Pendiente",
  resolved: "Resuelto",
  dismissed: "Descartado",
  user: "Usuario",
  seller: "Vendedor",
  superadmin: "Superadmin",
};

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;
  const cssClass = styles[status] || styles.inactive;

  return (
    <span className={`${styles.badge} ${cssClass}`}>
      <span className={styles.dot} />
      {label}
    </span>
  );
}
