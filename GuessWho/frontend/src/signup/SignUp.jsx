import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import { supabase } from "../../../backend/server";

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
      const { data, error } = await supabase
        .from("users")
        .insert({
          username,
          email,
          password,
        })
        .select()
        .single();

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      localStorage.setItem("currentUserId", data.id);

      setSuccessMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error(error);
      setErrorMessage("Cannot connect to the server");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Sign Up</div>
        <div className="underline"></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="inputs">
          <div className="input">
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

          <div className="input">
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

          <div className="input">
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
          <div className="success-message">{successMessage}</div>
        )}

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <button className="submit" type="submit" disabled={isFormIncomplete}>
          Sign Up
        </button>
      </form>

      <div className="login-link">
        Already have an account?{" "}
        <span onClick={() => navigate("/signin")}>Sign In</span>
      </div>
    </div>
  );
}

export default SignUp;
