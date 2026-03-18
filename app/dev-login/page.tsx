"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === "240695") {
      document.cookie = `dev_access=240695; path=/`;
      router.push(redirect);
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80 text-center">
        <h1 className="text-2xl font-bold mb-1">Futzer</h1>
        <p className="text-sm text-gray-500 mb-6">Acesso de desenvolvimento</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            className="border rounded-lg px-4 py-2 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">Senha incorreta</p>}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 font-semibold transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DevLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
