import styles from "./SkeletonCard.module.css";

export default function SkeletonCard() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.imagePlaceholder} />
      <div className={styles.content}>
        <div className={styles.badge} />
        <div className={styles.title} />
        <div>
          <div className={styles.textLine} style={{ marginBottom: "8px" }} />
          <div className={styles.textLineShort} />
        </div>
        <div className={styles.actions}>
          <div className={styles.button} />
          <div className={styles.iconButton} />
        </div>
      </div>
    </div>
  );
}