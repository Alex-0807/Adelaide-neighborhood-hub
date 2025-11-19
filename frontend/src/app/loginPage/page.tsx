"use client";
async function handleLogin(e: any) {
  e.preventDefault();
  const res = await fetch("http://localhost:3001/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: e.target.email.value,
      password: e.target.password.value,
    }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log("Login successful", data);
    alert("Login successful");
  } else {
    console.log("Login failed", data);
    alert("Login failed:" + data.error);
  }
}

export default function LoginPage() {
  return (
    <form onSubmit={handleLogin}>
      <input name="email" placeholder="Email" className="block" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
