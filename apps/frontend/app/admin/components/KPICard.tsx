import { type LucideIcon } from "lucide-react";
import styles from "./KPICard.module.css";

export type KPIColor = "blue" | "green" | "purple" | "orange" | "red";

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: KPIColor;
  trend?: { value: string; direction: "up" | "down" };
  loading?: boolean;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  color = "blue",
  trend,
  loading = false,
}: KPICardProps) {
  if (loading) {
    return (
      <div className={`${styles.card} ${styles[color]}`}>
        <div className={`${styles.iconWrapper} ${styles[`icon${capitalize(color)}`]}`}>
          <Icon size={22} />
        </div>
        <div className={`${styles.content} ${styles.skeleton}`}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonValue} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={`${styles.iconWrapper} ${styles[`icon${capitalize(color)}`]}`}>
        <Icon size={22} />
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>
          {typeof value === "number" ? value.toLocaleString("es-MX") : value}
        </span>
        {trend && (
          <span
            className={`${styles.trend} ${trend.direction === "up" ? styles.trendUp : styles.trendDown}`}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
