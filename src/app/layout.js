"use client";
import { useState } from "react";
import Script from "next/script";
import Header from "./component/Header";
import Footer from "./component/Footer";
import SideBar from "./component/SideBar";
import "./globals.css";
import "./darkMode.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";

export default function RootLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <html lang="en">
      <body>
        {/* Load scripts inside body */}
        <Script
          src="https://cdn.jsdelivr.net/npm/react-bootstrap@next/dist/react-bootstrap.min.js"
          strategy="beforeInteractive"
        />

        <div className="layout">
          {/* Sidebar with toggle functionality */}
          <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

          {/* Main Content */}
          <div className={`main-content ${isSidebarOpen ? "with-sidebar" : "full-width"}`}>
            <Header toggleSidebar={toggleSidebar} />
            <main>{children}</main>
            <Footer />
          </div>
        </div>

        <ToastContainer position="top-center" />
      </body>
    </html>
  );
}
