"use client";

import { useEffect, useState } from "react";
import { getCurrentUserApi } from "@/lib/api/auth";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser =  () => {
       getCurrentUserApi({ setUser, setLoading });
    };

    fetchCurrentUser();
  }, []);

  return { user, loading };
};
