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
      router.replace("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const authorities = decoded?.data?.authorities || [];

      const hasViewAccess = authorities.some(
        (auth) => auth.module === requiredModule && auth.actions.includes("view")
      );

      if (!hasViewAccess) {
        router.replace("/unauthorized");
        return;
      }

      setStatus("authorized");
    } catch {
      router.replace("/unauthorized");
    }
  }, [requiredModule, router]);

  if (status !== "authorized") return null;

  return <>{children}</>;
}
