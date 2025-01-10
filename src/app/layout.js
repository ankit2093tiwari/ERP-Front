"use client"

import { useState } from "react";
import Script from 'next/script';
import Header from "./component/Header";
import Footer from "./component/Footer";
import SideBar from "./component/SideBar"; // Import Sidebar component
import "./globals.css";
import "./darkMode.css";
import "bootstrap/dist/css/bootstrap.min.css";
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
          crossOrigin="anonymous"
        ></Script>

        <Script
          src="https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js"
          crossOrigin="anonymous"
        ></Script>

        <Script
          src="https://cdn.jsdelivr.net/npm/react-bootstrap@next/dist/react-bootstrap.min.js"
          crossOrigin="anonymous"
        ></Script>
      </head>
      <body>
        <div className="layout">
          {/* Sidebar */}
          <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

          {/* Main Content */}
          <div className={`main-content ${isSidebarOpen ? "with-sidebar" : "full-width"}`}>
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
