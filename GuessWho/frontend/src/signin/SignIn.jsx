import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SignIn.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message);
        return;
      }

      localStorage.setItem("currentUserId", String(data.id));

      setSuccessMessage("Welcome back!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Cannot connect to the server.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.text}>Sign In</div>
        <div className={styles.underline}></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.inputs}>
          <div className={styles.input}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.input}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <button className={styles.submit} type="submit">
          Sign In
        </button>
      </form>

      <div className={styles.signupLink}>
        Don't have an account?{" "}
        <span onClick={() => navigate("/")}>Sign Up</span>
      </div>
    </div>
  );
}

export default SignIn;
