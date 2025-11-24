"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function NavBar() {
  const { user, loading, setUser } = useAuth();

  const router = useRouter();
  async function handleLogout() {
    await fetch("http://localhost:3001/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    router.push("/loginPage");
  }
  if (loading) return null; // without this, CSR will be conflicted with SSR and cause hydration error
  //
  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 shadow">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-6">
        <div className="text-3xl font-bold">ANH Service</div>

        {user ? (
          <span>
            <button
              onClick={() => handleLogout()}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-green-700"
            >
              Logout
            </button>
            <button
              className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => router.push("/collectionPage")}
            >
              Collection
            </button>
          </span>
        ) : (
          <span>
            <button
              onClick={() => router.push("/loginPage")}
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/registerPage")}
              className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Register
            </button>
          </span>
        )}
      </div>
    </nav>
  );
}
