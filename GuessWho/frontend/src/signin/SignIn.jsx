import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";

import email_icon from "./Assets_SignUp/email.jpg";
import password_icon from "./Assets_SignUp/password.jpg";

function SignIn() {
  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const isFormIncomplete = !email.trim() || !password.trim();

  // Function
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isFormIncomplete) {
      alert("Email and Password are required.");
      return;
    }

    console.log("Email:", email);
    console.log("Password:", password);

    // Later this will call the backend API
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Sign In</div>
        <div className="underline"></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="inputs">
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

        <button className="submit" type="submit" disabled={isFormIncomplete}>
          Sign In
        </button>
      </form>

      <div className="login-link">
        Don't have an account?{" "}
        <span onClick={() => navigate("/signup")}>Sign Up</span>
      </div>
    </div>
  );
}

export default SignIn;
