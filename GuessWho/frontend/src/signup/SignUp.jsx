import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SignUp.module.css";
import email_icon from "./Assets_SignUp/email.jpg";
import user_icon from "./Assets_SignUp/user.jpg";
import password_icon from "./Assets_SignUp/password.jpg";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const isFormIncomplete =
    !username.trim() || !email.trim() || !password.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (isFormIncomplete) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        setErrorMessage(data.message);
        return;
      }
      navigate("/dashboard");

      setSuccessMessage("Account created successfully!");
    } catch (error) {
      console.error(error);
      setErrorMessage("Cannot connect to the server");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.text}>Sign Up</div>
        <div className={styles.underline}></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.inputs}>
          <div className={styles.input}>
            <img src={user_icon} alt="User" />

            <input
              name="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.input}>
            <img src={email_icon} alt="Email" />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.input}>
            <img src={password_icon} alt="Password" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <button
          className={styles.submit}
          type="submit"
          disabled={isFormIncomplete}
        >
          Sign Up
        </button>
      </form>

      <div className={styles.loginLink}>
        Already have an account?{" "}
        <span onClick={() => navigate("/signin")}>Sign In</span>
      </div>
    </div>
  );
}

export default SignUp;
