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
    if (command.includes("logout")) {
      handleLogout();
    } else if (command.includes("go to dashboard")) {
      router.replace("/");
    } else if (command.includes("login")) {
      router.replace("/login");
    } else if (command.includes("go to student")) {
      router.replace("/students/all-module");
    } else if (command.includes("go to master entry")) {
      router.replace("/master-entry/all-module");
    } else if (command.includes("go to transport")) {
      router.replace("/Transport/all-module");
    } else if (command.includes("go to fees")) {
      router.replace("/fees/all-module");
    } else if (command.includes("go to medical")) {
      router.replace("/medical/all-module");
    } else if (command.includes("go to stock")) {
      router.replace("/stock/all-module");
    } else if (command.includes("go to notice")) {
      router.replace("/notice/all-module");
    } else if (command.includes("go to home")) {
      router.replace("/home");
    } else if (command.includes("go to advertising management")) {
      router.replace("/advertising-management/all-module");
    } else if (command.includes("go to appointment")) {
      router.replace("/appointment");
    } else if (command.includes("go to dailydairy")) {
      router.replace("/dailyDairy");
    } else if (command.includes("go to exam")) {
      router.replace("/exam/all-module");
    } else if (command.includes("go to front office")) {
      router.replace("/front-office/all-module");
    } else if (command.includes("go to gallery")) {
      router.replace("/gallery/all-module");
    } else if (command.includes("go to hrd")) {
      router.replace("/hrd/allModule");
    } else if (command.includes("go to important SMS")) {
      router.replace("/importantSMS");
    } else if (command.includes("go to library")) {
      router.replace("/library/all-module");
    } else if (command.includes("go to student attendance")) {
      router.replace("/studentAttendence/allModule");
    } else if (command.includes("go to thought")) {
      router.replace("/thought");
    } else if (command.includes("go to user management")) {
      router.replace("/userManagement/all-module");
    } else if (command.includes("go to accounts")) {
      router.replace("/accounts/all-module");
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
            {/* <ToastContainer position="top-center" /> */}
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
            <SpeechRecognitionProvider onCommand={handleVoiceCommand} />
          </>
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </body>
    </html>
  );
}
