"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Menu, X, LayoutDashboard, PenTool, History, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    plan?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Apex<span className="text-indigo-400">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/dashboard" ? "text-indigo-400" : "text-slate-300 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/workspace"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/workspace" ? "text-indigo-400" : "text-slate-300 hover:text-white"
                }`}
              >
                AI Workspace
              </Link>
              <Link
                href="/history"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/history" ? "text-indigo-400" : "text-slate-300 hover:text-white"
                }`}
              >
                Saved History
              </Link>
              <Link
                href="/settings"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/settings" ? "text-indigo-400" : "text-slate-300 hover:text-white"
                }`}
              >
                Settings
              </Link>
            </>
          ) : (
            <>
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#templates" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Templates
              </a>
              <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Pricing
              </a>
            </>
          )}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-200">{user.name || user.email.split("@")[0]}</p>
                <span className="inline-block px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {user.plan || "Free"}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Log out">
                <LogOut className="w-4 h-4 text-slate-400 hover:text-red-400" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-6 space-y-3">
          {user ? (
            <>
              <div className="pb-3 mb-2 border-b border-slate-800">
                <p className="text-sm font-medium text-slate-200">{user.name || user.email}</p>
                <p className="text-xs text-indigo-400 font-semibold uppercase">{user.plan || "Free"} Plan</p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" /> Dashboard
              </Link>
              <Link
                href="/workspace"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
              >
                <PenTool className="w-4 h-4 text-purple-400" /> AI Workspace
              </Link>
              <Link
                href="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
              >
                <History className="w-4 h-4 text-pink-400" /> Saved History
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Settings
              </Link>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-400 border-red-500/20"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Log Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
              >
                Features
              </a>
              <a
                href="#templates"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
              >
                Templates
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
              >
                Pricing
              </a>
              <div className="pt-3 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
