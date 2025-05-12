// app/layout.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Header from "./component/Header";
import Footer from "./component/Footer";
import SideBar from "./component/SideBar";
import "./globals.css";
import "./darkMode.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./login";
import SpeechRecognitionProvider from "@/app/component/SpeechRecognitionProvider";

export default function RootLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    setIsLoading(false);

    if (!token && !window.location.pathname.includes("/login")) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogin = (token, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem("authToken", token);
    } else {
      sessionStorage.setItem("authToken", token);
    }
    setIsAuthenticated(true);
    router.replace("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    setIsAuthenticated(false);
    router.replace("/login");
  };

  const handleVoiceCommand = (command) => {
    if (command.includes("logout")) {
      handleLogout();
    } else if (command.includes("dashboard")) {
      router.replace("/");
    } else if (command.includes("login")) {
      router.replace("/login");
    }
    
  };

  if (isLoading) {
    return (
      <html lang="en">
        <body>
          <div className="d-flex justify-content-center align-items-center vh-100">
            Loading...
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <Script
          src="https://cdn.jsdelivr.net/npm/react-bootstrap@next/dist/react-bootstrap.min.js"
          strategy="beforeInteractive"
        />

        {isAuthenticated ? (
          <>
            <div className="layout">
              <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              <div className={`main-content ${isSidebarOpen ? "with-sidebar" : "full-width"}`}>
                <Header toggleSidebar={toggleSidebar} onLogout={handleLogout} />
                <main>{children}</main>
                <Footer />
              </div>
            </div>
            <ToastContainer position="top-center" />
            <SpeechRecognitionProvider onCommand={handleVoiceCommand} />
          </>
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </body>
    </html>
  );
}
