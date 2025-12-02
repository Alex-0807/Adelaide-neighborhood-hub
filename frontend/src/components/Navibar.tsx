"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function NavBar() {
  const { user, loading, setUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  async function handleLogout() {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
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
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:p-6">
        <div className="text-2xl md:text-3xl font-bold">ANH Service</div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center">
          {user ? (
            <div className="flex items-center">
              <button
                onClick={() => handleLogout()}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
              <button
                className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={() => router.push("/collectionPage")}
              >
                Collection
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <button
                onClick={() => router.push("/loginPage")}
                className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Login
              </button>

              <button
                onClick={() => router.push("/registerPage")}
                className="ml-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-black focus:outline-none"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 shadow-lg">
          <div className="flex flex-col space-y-3 mt-2">
            {user ? (
              <>
                <button
                  className="w-full text-left px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    router.push("/collectionPage");
                    setIsMenuOpen(false);
                  }}
                >
                  Collection
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    router.push("/loginPage");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    router.push("/registerPage");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
