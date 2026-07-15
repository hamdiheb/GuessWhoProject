import { useState } from "react";
import { useNavigate } from "react-router-dom";
import email_icon from "./Assets_SignUp/email.jpg";
import user_icon from "./Assets_SignUp/user.jpg";
import password_icon from "./Assets_SignUp/password.jpg";

const API_URL = import.meta.env.VITE_API_URL;

const inputRowClass =
  "group flex items-center gap-3 py-3.5 px-4 bg-surface-2 border border-border rounded-md transition-[border-color,box-shadow] duration-200 focus-within:border-accent-border focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)]";
const iconClass =
  "w-[18px] h-[18px] rounded-full opacity-75 grayscale contrast-[.9] brightness-150 transition-[opacity,filter] duration-200 group-focus-within:opacity-100 group-focus-within:grayscale-0 group-focus-within:sepia group-focus-within:saturate-[3] group-focus-within:hue-rotate-[-10deg] group-focus-within:brightness-110";
const textInputClass =
  "w-full flex-1 border-none outline-none bg-transparent text-[15px] text-ink placeholder:text-ink-dim";

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
      const response = await fetch(`${API_URL}/api/signup`, {
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

      if (!response.ok) {
        setErrorMessage(data.message || 'Something went wrong');
        return;
      }

      setSuccessMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/signin");
      }, 1000);
    } catch (error) {
      console.error(error);
      setErrorMessage("Cannot connect to the server");
    }
  };

  return (
    <div className="w-full max-w-md mx-4 sm:mx-auto my-8 sm:my-16 p-6 sm:p-10 bg-surface border border-border rounded-lg shadow-card animate-fade-slide-in">
      <div className="text-center mb-8">
        <div className="text-[32px] font-bold tracking-tight text-ink">Sign Up</div>
        <div className="w-[46px] h-[3px] bg-accent mx-auto mt-3.5 rounded-full" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <div className={inputRowClass}>
            <img src={user_icon} alt="User" className={iconClass} />

            <input
              name="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={textInputClass}
            />
          </div>

          <div className={inputRowClass}>
            <img src={email_icon} alt="Email" className={iconClass} />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={textInputClass}
            />
          </div>

          <div className={inputRowClass}>
            <img src={password_icon} alt="Password" className={iconClass} />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={textInputClass}
            />
          </div>
        </div>

        {successMessage && (
          <div className="text-success bg-success-soft px-3.5 py-2.5 rounded-sm mt-4 text-center text-sm">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="text-danger bg-danger-soft px-3.5 py-2.5 rounded-sm mt-4 text-center text-sm">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isFormIncomplete}
          className="w-full block mt-7 p-3.5 rounded-full bg-accent text-[#17130b] text-base font-bold cursor-pointer transition-[transform,filter,box-shadow,background-color,color] duration-200 ease-spring not-disabled:hover:scale-[1.02] not-disabled:hover:brightness-110 not-disabled:hover:shadow-[0_8px_24px_var(--color-accent-glow)] not-disabled:active:scale-[0.99] disabled:bg-surface-2 disabled:text-ink-dim disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Sign Up
        </button>
      </form>

      <div className="text-center mt-6 text-ink-dim text-sm">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/signin")}
          className="text-accent font-semibold cursor-pointer hover:underline"
        >
          Sign In
        </span>
      </div>
    </div>
  );
}

export default SignUp;
