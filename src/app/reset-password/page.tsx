"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ newPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Derived synchronously — no effect needed; token is available on first render.
  const tokenMissing = !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Reset failed."); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-[100px] pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">Apex<span className="text-indigo-400">AI</span></span>
        </Link>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-sm text-slate-400">Your password has been updated. Redirecting to login...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Set New Password</h1>
                <p className="text-sm text-slate-400 mt-1">Choose a strong, unique password.</p>
              </div>

              {tokenMissing && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">Invalid or missing token. Please request a new password reset.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="reset-password" className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      id="reset-password"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={form.newPassword}
                      onChange={(e) => { setForm({ newPassword: e.target.value }); setError(""); }}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200" aria-label="Toggle password visibility">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <div role="alert" className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">{error}</div>}
                <Button id="reset-submit-btn" type="submit" variant="primary" size="lg" isLoading={isLoading} disabled={tokenMissing} className="w-full font-semibold">
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
              <p className="text-center text-xs text-slate-500 mt-6">
                <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-semibold">Request new link</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
