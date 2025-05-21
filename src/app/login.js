"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSessions, setIsFetchingSessions] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const router = useRouter();
  const recognitionRef = useRef(null);

  // Fetch sessions
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

  // Voice recognition logic
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("Heard:", transcript);
      if (transcript.includes("login")) {
        handleLogin(new Event("submit"));
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [isListening]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password || !sessionId) {
      setError("Email, Password, and Session are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://erp-backend-fy3n.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, sessionId }),
      });

      const data = await response.json();
      if (data.success) {
        onLogin && onLogin(data.token, rememberMe, data.session.sessionName);
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
          <Image src="/sbllogo.webp" alt="Company Logo" width={120} height={50} priority />
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
            <label htmlFor="sessionId">SESSION *</label>
            <select
              id="sessionId"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="inputField"
              required
              disabled={isFetchingSessions}
            >
              <option value="">Select a session</option>
              {sessions.map((session) => (
                <option key={session._id} value={session._id}>
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
            {isLoading ? "Log In..." : "Log In"}
          </button>
        </form>
      </div>
      <button
        type="button"
        onClick={() => setIsListening((prev) => !prev)}
        className="mic-button"
      >
        🎤 {isListening ? "Stop Listening" : "Voice"}
      </button>
    </div>
  );
}