import { useEffect, useState } from "react";

export type AuthUser = {
  userId: number;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await fetch("http://localhost:3001/auth/me", {
          credentials: "include",
        });

        if (res.status === 200) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, []);

  return { user, loading, setUser };
}
