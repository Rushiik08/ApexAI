"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  History,
  Settings,
  Sparkles,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    plan?: string;
  };
  monthlyUsage?: number;
  monthlyLimit?: number;
}

export function Sidebar({ user, monthlyUsage = 0, monthlyLimit = 50 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "AI Workspace",
      href: "/workspace",
      icon: PenTool,
    },
    {
      label: "Saved History",
      href: "/history",
      icon: History,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const usagePercent = Math.min(100, Math.round((monthlyUsage / monthlyLimit) * 100));

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/70 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Plan & Usage Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Plan Usage
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              {user.plan || "Free"}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Monthly Quota</span>
              <span className="font-semibold text-slate-200">
                {monthlyUsage} / {monthlyLimit}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  usagePercent > 85 ? "bg-amber-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          <Link
            href="/workspace"
            className="mt-3 block text-center py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium text-indigo-300 transition-colors"
          >
            Create Content
          </Link>
        </div>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
              {(user.name?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.name || "User"}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
