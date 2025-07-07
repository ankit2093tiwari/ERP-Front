"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BASE_URL } from "@/Services";
import axios from "axios";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function LoginPage({ onLogin }) {
  const [username, setUSERNAME] = useState("");
  const [password, setPassword] = useState("");
  const [sessions, setSessions] = useState([]);
  // const [sessionId, setSessionId] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const router = useRouter();
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

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

      timeoutRef.current = setTimeout(() => {
        recognition.stop();
        setIsListening(false);
      }, 5000);
    } else {
      recognition.stop();
      clearTimeout(timeoutRef.current);
    }

    return () => {
      recognition.stop();
      clearTimeout(timeoutRef.current);
    };
  }, [isListening]);

  // useEffect(() => {
  //   const fetchSessions = async () => {
  //     const response = await axios.get(`${BASE_URL}/api/all-session`);
  //     const sessionData = response?.data?.data || [];
  //     setSessions(sessionData);

  //     if (sessionData.length > 0) {
  //       setSessionId(sessionData[0]._id);   //by default selected recent/current sesssion
  //     }
  //   };

  //   fetchSessions();
  // }, []);


  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("Username and Password are required");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/login`, {
        username,
        password,
      });

      const data = res.data;
      if (data.success) {
        onLogin && onLogin(data.token, rememberMe);
        router.push("/");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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
            <label htmlFor="username">User Name<span className="text-danger">*</span></label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUSERNAME(e.target.value)}
              className="inputField"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="password">PASSWORD<span className="text-danger">*</span></label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="inputField"
              required
            />
          </div>
          {/* <div className="formGroup">
            <label htmlFor="">Session<span className="text-danger">*</span></label>
            <select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              {
                sessions?.map((s) => (
                  <option key={s._id} value={s._id}>{s.sessionName}</option>
                ))
              }
            </select>
          </div> */}
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

          {error && <div className="errorMessage text-danger">{error}</div>}

          <button
            type="submit"
            className="loginButton"
            disabled={isLoading}
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
        🎤 {isListening ? "Listening..." : ""}
      </button>
    </div>
  );
}
