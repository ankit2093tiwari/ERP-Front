// app/layout.js
"use client";
import { Provider } from "react-redux";
import { store, persistor } from "@/Redux/store";
import { PersistGate } from "redux-persist/integration/react";
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
import { handleVoiceCommand as voiceCommandHandler } from "@/app/component/command";
import "@/Services";
import axios from "axios";
import Loader from "./component/Loader";

export default function RootLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      : null;

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (!window.location.pathname.includes("/login")) {
        router.replace("/login");
      }
    }

    setIsLoading(false);
  }, [router]);

  const handleLogin = (token, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem("authToken", token);
    } else {
      sessionStorage.setItem("authToken", token);
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setIsAuthenticated(true);
    router.replace("/");
  };

  const handleLogout = () => {
    if (!confirm("Are you sure to want to logout?")) return
    localStorage.clear()
    sessionStorage.removeItem("authToken");
    setIsAuthenticated(false);
    router.replace("/login");
  };

  const handleCommand = (command) => {
    voiceCommandHandler(command, router, handleLogout);
  };

  if (isLoading) {
    return (
      <html lang="en">
        <body>
          <Loader />
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
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
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
                <ToastContainer position="top-right" autoClose={5000} />
                <SpeechRecognitionProvider onCommand={handleCommand} />
              </>
            ) : (
              <LoginPage onLogin={handleLogin} />
            )}
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
