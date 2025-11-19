"use client";
async function handlerRegister(e: any) {
  e.preventDefault();
  const res = await fetch("http://localhost:3001/auth/register", {
    method: "POST",
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
    console.log("Registration successful", data);
    alert("Registration successful");
  } else {
    console.log("Registration failed", data);
    alert("Registration failed:" + data.error);
  }
}

export default function RegisterPage() {
  return (
    <form onSubmit={handlerRegister}>
      <input name="email" placeholder="Email" className="block" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  );
}
