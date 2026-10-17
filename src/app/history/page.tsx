"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  History, Search, Filter, Star, Trash2, Eye, PenTool, X,
  FileText, Share2, Mail, ShoppingBag, TrendingUp, Zap, Sparkles,
  ChevronLeft, ChevronRight, Copy, Check, Save, ArrowLeft
} from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

interface Generation {
  id: string;
  title: string;
  contentType: string;
  topic: string;
  prompt: string;
  generatedContent: string;
  tone?: string;
  audience?: string;
  length?: string;
  language?: string;
  modelUsed?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

const CONTENT_TYPES = ["blog", "article", "social", "marketing", "product", "email", "summary", "general"];

const typeColors: Record<string, string> = {
  blog: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  article: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  social: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  email: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  product: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  marketing: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  summary: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  general: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

const contentTypeIcons: Record<string, React.ReactNode> = {
  blog: <FileText className="w-4 h-4" />, article: <FileText className="w-4 h-4" />,
  social: <Share2 className="w-4 h-4" />, email: <Mail className="w-4 h-4" />,
  product: <ShoppingBag className="w-4 h-4" />, marketing: <TrendingUp className="w-4 h-4" />,
  summary: <Zap className="w-4 h-4" />, general: <Sparkles className="w-4 h-4" />,
};

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) setIsLoading(true);
    });
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      sortBy,
      ...(search && { search }),
      ...(contentTypeFilter && { contentType: contentTypeFilter }),
      ...(favoriteOnly && { favorite: "true" }),
    });
    fetch(`/api/generations?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setGenerations(data.generations || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [page, sortBy, search, contentTypeFilter, favoriteOnly]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(e.target.value);
      setPage(1);
    }, 400);
  };

  const handleToggleFavorite = async (gen: Generation) => {
    try {
      await fetch(`/api/generations/${gen.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !gen.isFavorite }),
      });
      setGenerations((prev) => prev.map((g) => g.id === gen.id ? { ...g, isFavorite: !g.isFavorite } : g));
      if (selectedGen?.id === gen.id) setSelectedGen((p) => p ? { ...p, isFavorite: !p.isFavorite } : p);
    } catch { /* ignore */ }
  };

  const handleOpenDetail = (gen: Generation) => {
    setSelectedGen(gen);
    setEditTitle(gen.title);
    setEditContent(gen.generatedContent);
    setIsEditing(false);
    setCopied(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedGen) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/generations/${selectedGen.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, generatedContent: editContent }),
      });
      if (!res.ok) return;
      const updated = { ...selectedGen, title: editTitle, generatedContent: editContent };
      setSelectedGen(updated);
      setGenerations((prev) => prev.map((g) => g.id === selectedGen.id ? updated : g));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/generations/${deleteId}`, { method: "DELETE" });
      setGenerations((prev) => prev.filter((g) => g.id !== deleteId));
      if (selectedGen?.id === deleteId) setSelectedGen(null);
      setTotal((t) => t - 1);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCopy = () => {
    if (!selectedGen) return;
    navigator.clipboard.writeText(`${editTitle}\n\n${editContent}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-pink-400" />
            <h1 className="text-2xl font-bold text-white">Saved History</h1>
          </div>
          <p className="text-sm text-slate-400">{total} generation{total !== 1 ? "s" : ""} saved in your library.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="history-search"
              type="text"
              placeholder="Search title, topic, content..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="history-type-filter"
              value={contentTypeFilter}
              onChange={(e) => { setContentTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            >
              <option value="">All Types</option>
              {CONTENT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>

            <select
              id="history-sort"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A-Z</option>
            </select>

            <button
              id="history-fav-toggle"
              onClick={() => { setFavoriteOnly(!favoriteOnly); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                favoriteOnly
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Star className={`w-4 h-4 ${favoriteOnly ? "fill-amber-400" : ""}`} />
              Favorites
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              ))
            ) : generations.length === 0 ? (
              <div className="py-16 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center gap-3">
                <History className="w-8 h-8 text-slate-700" />
                <p className="text-sm text-slate-500">
                  {search || contentTypeFilter || favoriteOnly ? "No results match your filters." : "No saved generations yet."}
                </p>
                {!(search || contentTypeFilter || favoriteOnly) && (
                  <Button variant="primary" size="sm" onClick={() => window.location.href = "/workspace"}>
                    <PenTool className="w-4 h-4 mr-1.5" /> Go to Workspace
                  </Button>
                )}
              </div>
            ) : (
              generations.map((gen) => (
                <div
                  key={gen.id}
                  onClick={() => handleOpenDetail(gen)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all group ${
                    selectedGen?.id === gen.id
                      ? "bg-indigo-500/10 border-indigo-500/30"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="overflow-hidden flex-1">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border mb-2 ${typeColors[gen.contentType] || "text-slate-400 bg-slate-700/40"}`}>
                        {contentTypeIcons[gen.contentType]} {gen.contentType}
                      </div>
                      <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white">
                        {truncateText(gen.title, 50)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(gen.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        id={`fav-btn-${gen.id}`}
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(gen); }}
                        className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                        title={gen.isFavorite ? "Remove favorite" : "Add favorite"}
                      >
                        <Star className={`w-4 h-4 ${gen.isFavorite ? "text-amber-400 fill-amber-400" : "text-slate-500 hover:text-amber-400"}`} />
                      </button>
                      <button
                        id={`delete-btn-${gen.id}`}
                        onClick={(e) => { e.stopPropagation(); setDeleteId(gen.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-3">
            {selectedGen ? (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden sticky top-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50 gap-2 flex-wrap">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${typeColors[selectedGen.contentType] || ""}`}>
                    {contentTypeIcons[selectedGen.contentType]} {selectedGen.contentType}
                  </div>
                  <div className="flex items-center gap-2">
                    <button id="detail-copy-btn" onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button id="detail-edit-btn" onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
                      <PenTool className="w-3.5 h-3.5" /> {isEditing ? "Cancel" : "Edit"}
                    </button>
                    <button onClick={() => setSelectedGen(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {isEditing ? (
                    <>
                      <input
                        id="detail-title-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-indigo-500/40 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                      />
                      <textarea
                        id="detail-content-textarea"
                        rows={14}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-indigo-500/40 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none font-mono"
                      />
                      <Button id="detail-save-btn" variant="primary" size="sm" isLoading={isSaving} onClick={handleSaveEdit} className="w-full">
                        <Save className="w-4 h-4 mr-1.5" /> Save Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-white leading-snug">{editTitle}</h2>
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                        {selectedGen.tone && <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">Tone: {selectedGen.tone}</span>}
                        {selectedGen.audience && <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">Audience: {selectedGen.audience}</span>}
                        {selectedGen.length && <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">Length: {selectedGen.length}</span>}
                        {selectedGen.modelUsed && <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">{selectedGen.modelUsed}</span>}
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">{formatDate(selectedGen.createdAt)}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</p>
                      <p className="text-sm text-slate-300 italic">{selectedGen.topic}</p>
                      <div className="border-t border-slate-800 pt-4">
                        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{editContent}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-3 text-center p-8">
                <Eye className="w-8 h-8 text-slate-700" />
                <p className="text-sm text-slate-500">Select a generation to view, edit, or manage it.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Generation"
        message="This will permanently remove the saved generation from your library. This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
}
