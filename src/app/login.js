"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.success) {
        onLogin && onLogin(data.token, rememberMe);
        router.push("/");
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
    <div className="loginPage">
      <div className="loginBox">
        <div className="logoContainer">
          <Image 
            src="/sbllogo.webp" 
            alt="Company Logo"
            width={150} 
            height={70} 
            priority 
          />
        </div>
        
        <h2 className="title">SIGN IN</h2>
        <p className="subtitle">For your protection, please verify your identity.</p>

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
      </div>
    </div>
  );
}