"use client";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Login successful", data);
        alert("Login successful");
        router.push("/");
      } else {
        console.log("Login failed", data);
        alert("Login failed:" + (data.error ?? "unknown"));
      }
    } catch (err) {
      console.error("Network or unexpected error", err);
      alert("Login failed: network error");
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input name="email" placeholder="Email" className="block" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
