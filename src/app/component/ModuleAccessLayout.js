"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function ModuleAccessLayout({ children, requiredModule }) {
  const router = useRouter();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      setStatus("unauthorized");
      router.replace("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const hasAccess = decoded.data?.authorities?.some(
        (auth) => auth.module === requiredModule
      );

      if (!hasAccess) {
        setStatus("unauthorized");
        router.replace("/unauthorized");
        return;
      }

      setStatus("authorized");
    } catch (error) {
      console.error("JWT decode failed:", error);
      setStatus("unauthorized");
      router.replace("/unauthorized");
    }
  }, [requiredModule, router]);

  if (status === "loading" || status === "unauthorized") return null;

  return <>{children}</>;
}
