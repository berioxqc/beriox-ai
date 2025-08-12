import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Beriox AI</h1>
        <p>Intelligence artificielle avancée</p>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="#"
          >
            Commencer
          </a>
        </div>
      </main>
    </div>
  );
}
