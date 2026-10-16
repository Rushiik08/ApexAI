"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [devToken, setDevToken] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Request failed."); return; }
      if (data.devToken) setDevToken(data.devToken);
      setSubmitted(true);
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
          {submitted ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-sm text-slate-400 mb-6">
                If an account exists for <span className="text-indigo-300 font-medium">{email}</span>, a password reset link has been sent.
              </p>
              {devToken && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left mb-6">
                  <p className="text-xs font-bold text-amber-400 uppercase mb-1">Dev Mode — Reset Link</p>
                  <Link
                    href={`/reset-password?token=${devToken}`}
                    className="text-xs text-amber-300 hover:underline break-all"
                  >
                    {`/reset-password?token=${devToken}`}
                  </Link>
                </div>
              )}
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Reset your password</h1>
                <p className="text-sm text-slate-400 mt-1">Enter your email and we&apos;ll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent transition-all"
                  />
                </div>
                {error && (
                  <div role="alert" className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">{error}</div>
                )}
                <Button id="forgot-submit-btn" type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full font-semibold">
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <p className="text-center text-xs text-slate-500 mt-6">
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
