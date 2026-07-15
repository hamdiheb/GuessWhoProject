import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>GuessWho</span>
        <span className={styles.tagline}>Answer honestly, guess wisely.</span>
        <span className={styles.copyright}>© {new Date().getFullYear()} GuessWho</span>
      </div>
    </footer>
  );
}

export default Footer;
