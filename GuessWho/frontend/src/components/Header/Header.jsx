import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../Button/Button";
import styles from "./Header.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("currentUserId");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    fetch(`${API_URL}/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUsername(data.username || "");
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [userId, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("currentUserId");
    navigate("/signin");
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={userId ? "/dashboard" : "/"} className={styles.brand}>
          <img src="/favicon.svg" alt="" className={styles.logo} />
          <span>GuessWho</span>
        </Link>

        <nav className={styles.nav}>
          {userId ? (
            <>
              {username && <span className={styles.username}>Hi, {username}</span>}
              <Button variant="ghost" className={styles.navButton} onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/signin" className={styles.navLink}>
                Sign In
              </Link>
              <Link to="/" className={styles.navLink}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
