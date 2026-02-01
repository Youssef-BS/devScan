"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getCurrentUserApi } from "@/lib/api/auth";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cookieUser = Cookies.get("user");

      if (cookieUser) {
        setUser(JSON.parse(cookieUser));
        setLoading(false);
        return;
      }
    } catch (error) {
      console.warn("Invalid user cookie, clearing it");
      Cookies.remove("user");
    }

    getCurrentUserApi({
      setUser,
      setLoading,
    });
  }, []);

  return { user, loading };
};
