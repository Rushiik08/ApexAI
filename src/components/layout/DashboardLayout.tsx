"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Loader2 } from "lucide-react";

interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  monthlyGenerationsLimit?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [stats, setStats] = useState<{ monthlyUsage: number; monthlyLimit: number }>({
    monthlyUsage: 0,
    monthlyLimit: 50,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, statsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/dashboard/stats"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.stats) {
            setStats({
              monthlyUsage: statsData.stats.monthlyUsage || 0,
              monthlyLimit: statsData.stats.monthlyLimit || 50,
            });
          }
        }
      } catch (err) {
        console.error("Dashboard layout load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400 font-medium">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />
      <div className="flex-1 flex overflow-hidden">
        {user && (
          <div className="hidden md:block">
            <Sidebar
              user={user}
              monthlyUsage={stats.monthlyUsage}
              monthlyLimit={stats.monthlyLimit}
            />
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
