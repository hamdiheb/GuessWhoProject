import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const inputRowClass =
  "flex items-center gap-3 py-3.5 px-4 bg-surface-2 border border-border rounded-md transition-[border-color,box-shadow] duration-200 focus-within:border-accent-border focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)]";
const textInputClass =
  "w-full flex-1 border-none outline-none bg-transparent text-[15px] text-ink placeholder:text-ink-dim";

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
    <div className="max-w-md mx-4 sm:mx-auto my-8 sm:my-16 p-6 sm:p-10 bg-surface border border-border rounded-lg shadow-card animate-fade-slide-in">
      <div className="text-center mb-8">
        <div className="text-[32px] font-bold tracking-tight text-ink">Sign In</div>
        <div className="w-[46px] h-[3px] bg-accent mx-auto mt-3.5 rounded-full" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <div className={inputRowClass}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={textInputClass}
            />
          </div>

          <div className={inputRowClass}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          className="w-full block mt-7 p-3.5 rounded-full bg-accent text-[#17130b] text-base font-bold cursor-pointer transition-[transform,filter,box-shadow,background-color,color] duration-200 ease-spring not-disabled:hover:scale-[1.02] not-disabled:hover:brightness-110 not-disabled:hover:shadow-[0_8px_24px_var(--color-accent-glow)] not-disabled:active:scale-[0.99] disabled:bg-surface-2 disabled:text-ink-dim disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Sign In
        </button>
      </form>

      <div className="text-center mt-6 text-ink-dim text-sm">
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/")}
          className="text-accent font-semibold cursor-pointer hover:underline"
        >
          Sign Up
        </span>
      </div>
    </div>
  );
}

export default SignIn;
