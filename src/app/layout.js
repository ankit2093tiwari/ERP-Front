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

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/react-bootstrap@next/dist/react-bootstrap.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <div className="layout">
          {/* Sidebar with toggle functionality */}
          <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

          {/* Main Content */}
          <div
            className="main-content"
            // style={{
            //   marginLeft: isSidebarOpen ? "250px" : "80px",
            //   transition: "margin-left 0.2s ease",
            // }}
          >
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