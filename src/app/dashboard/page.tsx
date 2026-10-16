"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import {
  LayoutDashboard, Sparkles, TrendingUp, Star, Zap,
  PenTool, ArrowRight, FileText, Share2, Mail, ShoppingBag, History,
} from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

interface DashboardStats {
  totalGenerations: number;
  favoriteCount: number;
  monthlyUsage: number;
  monthlyLimit: number;
  plan: string;
  totalTokens: number;
}

interface TypeBreakdown { type: string; count: number; }
interface RecentGeneration {
  id: string;
  title: string;
  contentType: string;
  topic: string;
  createdAt: string;
  isFavorite: boolean;
}
interface ActivityDay { date: string; count: number; tokens: number; }

const contentTypeIcons: Record<string, React.ReactNode> = {
  blog: <FileText className="w-4 h-4" />,
  article: <FileText className="w-4 h-4" />,
  social: <Share2 className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  product: <ShoppingBag className="w-4 h-4" />,
  marketing: <TrendingUp className="w-4 h-4" />,
  summary: <Zap className="w-4 h-4" />,
  general: <Sparkles className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  blog: "text-indigo-400 bg-indigo-500/10",
  article: "text-blue-400 bg-blue-500/10",
  social: "text-pink-400 bg-pink-500/10",
  email: "text-amber-400 bg-amber-500/10",
  product: "text-emerald-400 bg-emerald-500/10",
  marketing: "text-purple-400 bg-purple-500/10",
  summary: "text-cyan-400 bg-cyan-500/10",
  general: "text-slate-400 bg-slate-500/10",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdown[]>([]);
  const [recentGenerations, setRecentGenerations] = useState<RecentGeneration[]>([]);
  const [activityData, setActivityData] = useState<ActivityDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) { setError("Failed to load dashboard data."); return; }
        const data = await res.json();
        setStats(data.stats);
        setTypeBreakdown(data.typeBreakdown || []);
        setRecentGenerations(data.recentGenerations || []);
        setActivityData(data.activityData || []);
      } catch {
        setError("Network error loading dashboard.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const usagePercent = stats ? Math.min(100, Math.round((stats.monthlyUsage / stats.monthlyLimit) * 100)) : 0;
  const maxActivity = activityData.length > 0 ? Math.max(...activityData.map((d) => d.count), 1) : 1;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-5 h-5 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            </div>
            <p className="text-sm text-slate-400">Your content generation overview and activity.</p>
          </div>
          <Link href="/workspace">
            <Button variant="primary" size="sm">
              <PenTool className="w-4 h-4 mr-1.5" /> New Generation
            </Button>
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Generations" value={stats.totalGenerations} icon={<Sparkles className="w-5 h-5 text-indigo-400" />} color="indigo" />
              <StatCard label="Favorites" value={stats.favoriteCount} icon={<Star className="w-5 h-5 text-amber-400" />} color="amber" />
              <StatCard label="This Month" value={`${stats.monthlyUsage} / ${stats.monthlyLimit}`} icon={<Zap className="w-5 h-5 text-purple-400" />} color="purple" />
              <StatCard label="Total Tokens Used" value={stats.totalTokens.toLocaleString()} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} color="emerald" />
            </div>

            {/* Monthly Quota Bar */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-200">Monthly Quota</h3>
                <span className="text-xs font-medium text-slate-400">
                  {stats.monthlyUsage} of {stats.monthlyLimit} used ({usagePercent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${usagePercent > 85 ? "bg-amber-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {usagePercent > 85 && (
                <p className="text-xs text-amber-400 mt-2">⚠ Approaching monthly limit. Consider upgrading your plan.</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Chart */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">7-Day Activity</h3>
                <div className="flex items-end justify-between gap-2 h-24">
                  {activityData.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                        <div
                          className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-indigo-600 to-purple-500 transition-all duration-500 min-h-[4px]"
                          style={{ height: `${Math.max(4, (day.count / maxActivity) * 80)}px` }}
                          title={`${day.count} generations`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{day.date}</span>
                    </div>
                  ))}
                </div>
                {activityData.every((d) => d.count === 0) && (
                  <p className="text-xs text-slate-500 text-center mt-2">No activity this week yet. Start generating!</p>
                )}
              </div>

              {/* Content Type Breakdown */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">By Content Type</h3>
                {typeBreakdown.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-xs text-slate-500">No generations yet.</p>
                    <Link href="/workspace" className="text-xs text-indigo-400 hover:underline mt-2">
                      Create your first →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {typeBreakdown.map((item) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium ${typeColors[item.type] || "text-slate-400 bg-slate-700/40"}`}>
                          {contentTypeIcons[item.type] || <Sparkles className="w-3.5 h-3.5" />}
                          <span className="capitalize">{item.type}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-300">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Generations */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" /> Recent Generations
                </h3>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              {recentGenerations.length === 0 ? (
                <div className="py-10 text-center">
                  <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 mb-4">No content generated yet.</p>
                  <Link href="/workspace">
                    <Button variant="primary" size="sm">
                      <PenTool className="w-4 h-4 mr-1.5" /> Create First Generation
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentGenerations.map((gen) => (
                    <Link
                      key={gen.id}
                      href={`/history?view=${gen.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg shrink-0 ${typeColors[gen.contentType] || "bg-slate-700/40 text-slate-400"}`}>
                          {contentTypeIcons[gen.contentType] || <Sparkles className="w-3.5 h-3.5" />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">{truncateText(gen.title, 55)}</p>
                          <p className="text-[11px] text-slate-500">{formatDate(gen.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        {gen.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const borderColor: Record<string, string> = {
    indigo: "border-indigo-500/20",
    amber: "border-amber-500/20",
    purple: "border-purple-500/20",
    emerald: "border-emerald-500/20",
  };
  return (
    <div className={`p-5 rounded-2xl bg-slate-900/60 border ${borderColor[color] || "border-slate-800"} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
