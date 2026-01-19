"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/current-user", {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null)
          return ;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return { user, loading };
};
