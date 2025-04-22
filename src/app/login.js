"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email and Password are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://erp-backend-fy3n.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // ✅ email instead of username
      });

      const data = await response.json();
      if (data.success) {
        onLogin && onLogin(data.token, rememberMe);
        router.push("/"); // Redirect after login
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="loginBox">
        <h2 className="title">SIGN IN</h2>
        <p className="subtitle">Verify your identity to continue</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin} className="loginForm">
          <div className="formGroup">
            <label htmlFor="email">EMAIL *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="inputField"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="password">PASSWORD *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="inputField"
              required
            />
          </div>

          <div className="rememberMe">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox"
            />
            <label htmlFor="rememberMe">REMEMBER ME</label>
          </div>

          <button type="submit" className="loginButton" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="footerLinks">
          <a href="#">Teacher Info</a>
          <a href="#">Communication</a>
          <a href="#">Students</a>
          <a href="#">Attendance</a>
        </div>
      </div>
    </div>
  );
}
