"use client";

import { useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  /* =========================
    Cargar usuario al iniciar
  ========================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // escuchar cambios entre pestañas
    const syncUser = () => {
      const updated = localStorage.getItem("user");
      setUser(updated ? JSON.parse(updated) : null);
    };

    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  /* =========================
    LOGIN
  ========================= */
  const login = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // actualizar navbar inmediatamente
    window.dispatchEvent(new Event("storage"));
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);

    window.dispatchEvent(new Event("storage"));
  };

  return {
    user,
    login,
    logout,
  };
}
