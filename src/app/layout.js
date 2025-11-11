"use client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, persistor } from "@/Redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import { clearAuth } from "@/Redux/Slices/authSlice";

function AppContent({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const token = useSelector((state) => state?.auth?.token);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [pathname, isMobile]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 468);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    if (!confirm("Are you sure to want to logout?")) return;
    dispatch(clearAuth()); // Redux + persist will clear token/user/authorities
    router.replace("/login");
  };

  if (!token) {
    return <LoginPage />;
  }

  return (
    <>
      <div className="layout">
        <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`main-content ${isSidebarOpen ? "with-sidebar" : "full-width"
            }`}
        >
          <Header toggleSidebar={toggleSidebar} onLogout={handleLogout} />
          <main>{children}</main>
          <Footer />
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppContent>{children}</AppContent>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
