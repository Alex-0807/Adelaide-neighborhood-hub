"use client";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 shadow">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-6">
        <div className="text-3xl font-bold">ANH Service</div>

        <button
          onClick={() => router.push("/loginPage")}
          className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
        >
          Log in
        </button>
      </div>
    </nav>
  );
}
