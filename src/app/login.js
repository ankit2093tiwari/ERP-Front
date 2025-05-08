"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [sessions, setSessions] = useState([]);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSessions, setIsFetchingSessions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      setIsFetchingSessions(true);
      try {
        const response = await fetch("https://erp-backend-fy3n.onrender.com/api/all-session");
        const data = await response.json();
        if (data.success) {
          setSessions(data.data);
        } else {
          setError("Failed to fetch sessions");
        }
      } catch (error) {
        setError("Error fetching sessions");
        console.error("Session fetch error:", error);
      } finally {
        setIsFetchingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password || !sessionName) {
      setError("Email, Password, and Session are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://erp-backend-fy3n.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, sessionName }),
      });

      const data = await response.json();
      if (data.success) {
        onLogin && onLogin(data.token, rememberMe, sessionName);
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
            width={120} 
            height={50} 
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

          <div className="formGroup">
            <label htmlFor="sessionName">SESSION *</label>
            <select
              id="sessionName"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="inputField"
              required
              disabled={isFetchingSessions}
            >
              <option value="">Select a session</option>
              {sessions.map((session) => (
                <option key={session._id} value={session.sessionName}>
                  {session.sessionName}
                </option>
              ))}
            </select>
            {isFetchingSessions && <p>Loading sessions...</p>}
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

          {error && <div className="errorMessage">{error}</div>}

          <button 
            type="submit" 
            className="loginButton" 
            disabled={isLoading || isFetchingSessions}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}