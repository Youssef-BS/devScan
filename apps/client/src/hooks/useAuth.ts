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
          throw new Error("Not authenticated");
        }

        const data = await res.json();
        setUser(data.user);
        console.log("Fetched user:", data.user);
      } catch (error) {
        console.error("Error fetching current user:", error);
        setUser(null);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

  return { user, loading };
};
