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
    router.replace("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    setIsAuthenticated(false);
    router.replace("/login");
  };

  const handleVoiceCommand = (command) => {
    const routes = {
      "logout": "/login",
      "go to dashboard": "/",
      "login": "/login",
      "go to student": "/students/all-module",
      "go to master entry": "/master-entry/all-module",
      "go to transport": "/Transport/all-module",
      "go to fees": "/fees/all-module",
      "go to medical": "/medical/all-module",
      "go to stock": "/stock/all-module",
      "go to notice": "/notice/all-module",
      "go to home": "/home",
      "go to advertising management": "/advertising-management/all-module",
      "go to appointment": "/appointment",
      "go to dailydairy": "/dailyDairy",
      "go to exam": "/exam/all-module",
      "go to front office": "/front-office/all-module",
      "go to gallery": "/gallery/all-module",
      "go to hrd": "/hrd/allModule",
      "go to important sms": "/importantSMS",
      "go to library": "/library/all-module",
      "go to student attendance": "/studentAttendence/allModule",
      "go to thought": "/thought",
      "go to user management": "/userManagement/all-module",
      "go to accounts": "/accounts/all-module"
    };

    // Check for exact matches first
    if (routes[command]) {
      router.replace(routes[command]);
      return;
    }

    // Check for partial matches
    for (const [key, route] of Object.entries(routes)) {
      if (command.includes(key)) {
        router.replace(route);
        return;
      }
    }

    console.log("Command not recognized:", command);
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
                <div className="voice-command-button">
                  <SpeechRecognitionProvider onCommand={handleVoiceCommand} />
                </div>
              </div>
            </div>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </>
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </body>
    </html>
  );
}