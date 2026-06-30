"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff } from "lucide-react";

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? "";
  const pref = searchParams.get("pref") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, ref, pref }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Registration failed");
      } else {
        // Account is auto-verified — go straight to login
        router.push("/auth/login?registered=1");
      }
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
            <Zap size={24} className="text-white" />
            <span>PIYROX</span>
          </Link>
          <p className="text-zinc-400 mt-2 text-sm">Create your account</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md p-8 rounded-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {ref && <p className="text-xs text-zinc-400">Referred by a friend 🎉</p>}
            {err && <p className="text-red-400 text-sm">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black hover:bg-zinc-200 font-medium w-full py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-white hover:text-zinc-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}
