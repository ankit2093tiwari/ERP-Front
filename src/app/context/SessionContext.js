"use client";
import { createContext, useContext, useState, useEffect } from "react";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  useEffect(() => {
    const storedSession = localStorage.getItem("selectedSessionId");
    if (storedSession) {
      setSelectedSessionId(storedSession);
    }
  }, []);

  const changeSession = (id) => {
    localStorage.setItem("selectedSessionId", id);
    setSelectedSessionId(id);
  };

  return (
    <SessionContext.Provider value={{ selectedSessionId, changeSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
