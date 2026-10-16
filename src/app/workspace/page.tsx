"use client";

import React, { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import {
  PenTool, Sparkles, Copy, Check, Save, RefreshCw, Wand2,
  ChevronDown, AlertCircle, CheckCircle2, FileText, Share2,
  Mail, ShoppingBag, TrendingUp, Zap,
} from "lucide-react";

const CONTENT_TYPES = [
  { value: "blog", label: "Blog Post", icon: FileText, description: "Long-form, structured articles" },
  { value: "article", label: "Article", icon: FileText, description: "In-depth editorial content" },
  { value: "social", label: "Social Media", icon: Share2, description: "Engaging posts with hashtags" },
  { value: "marketing", label: "Marketing Copy", icon: TrendingUp, description: "Persuasive sales content" },
  { value: "product", label: "Product Description", icon: ShoppingBag, description: "Benefit-driven listings" },
  { value: "email", label: "Email Draft", icon: Mail, description: "Professional email campaigns" },
  { value: "summary", label: "Summary", icon: Zap, description: "Concise executive summaries" },
  { value: "general", label: "General Text", icon: Sparkles, description: "Flexible free-form content" },
];

const TONES = ["Professional", "Casual", "Authoritative", "Friendly", "Enthusiastic", "Formal"];
const AUDIENCES = ["General Audience", "Developers", "Executives", "Marketers", "Students", "Customers"];
const LENGTHS = [
  { value: "short", label: "Short (150-250 words)" },
  { value: "medium", label: "Medium (400-600 words)" },
  { value: "long", label: "Long (800-1200 words)" },
];

interface GeneratedResult {
  title: string;
  content: string;
  model: string;
  provider: string;
  tokensUsed: number;
}

export default function WorkspacePage() {
  const [contentType, setContentType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("General Audience");
  const [length, setLength] = useState("medium");
  const [instructions, setInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<"generate" | "regenerate" | "improve">("generate");
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (mode: "generate" | "regenerate" | "improve" = "generate") => {
    if (!topic.trim()) { setError("Please enter a topic or prompt."); return; }
    setIsGenerating(true);
    setError("");
    setActiveMode(mode);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          topic: topic.trim(),
          tone: tone.toLowerCase(),
          audience: audience.toLowerCase(),
          length,
          instructions: instructions.trim() || undefined,
          mode,
          existingContent: mode !== "generate" && result ? result.content : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed. Please try again.");
        return;
      }

      setResult(data);
      setEditedContent(data.content);
      setEditedTitle(data.title);
      setIsEditing(false);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editedTitle || result.title,
          contentType,
          topic: topic.trim(),
          prompt: topic.trim() + (instructions ? `\n\nInstructions: ${instructions}` : ""),
          generatedContent: editedContent || result.content,
          tone: tone.toLowerCase(),
          audience: audience.toLowerCase(),
          length,
          modelUsed: result.model,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save.");
        setSaveStatus("error");
        return;
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    }
  };

  const handleCopy = () => {
    const text = `${editedTitle || result?.title}\n\n${editedContent || result?.content}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedType = CONTENT_TYPES.find((t) => t.value === contentType);
  const TypeIcon = selectedType?.icon || Sparkles;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PenTool className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">AI Workspace</h1>
          </div>
          <p className="text-sm text-slate-400">Configure your generation parameters and create premium content.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left Panel — Configuration */}
          <div className="xl:col-span-2 space-y-5">
            {/* Content Type */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = contentType === type.value;
                  return (
                    <button
                      key={type.value}
                      id={`content-type-${type.value}`}
                      onClick={() => setContentType(type.value)}
                      title={type.description}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                        isSelected
                          ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-300"
                          : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" /> {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic / Prompt */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <label htmlFor="workspace-topic" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Topic / Prompt *
              </label>
              <textarea
                id="workspace-topic"
                rows={4}
                value={topic}
                onChange={(e) => { setTopic(e.target.value); if (error) setError(""); }}
                placeholder={`What would you like to generate? e.g. "10 productivity tips for remote developers" or "Why TypeScript is essential in 2025"`}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Options */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Options</h3>

              <Select id="workspace-tone" label="Tone of Voice" value={tone} onChange={setTone} options={TONES} />
              <Select id="workspace-audience" label="Target Audience" value={audience} onChange={setAudience} options={AUDIENCES} />
              <Select
                id="workspace-length"
                label="Output Length"
                value={length}
                onChange={setLength}
                options={LENGTHS.map((l) => l.label)}
                values={LENGTHS.map((l) => l.value)}
              />

              <div>
                <label htmlFor="workspace-instructions" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Additional Instructions <span className="text-slate-600">(optional)</span>
                </label>
                <textarea
                  id="workspace-instructions"
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Any specific requirements, style notes, or keywords to include..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all resize-none"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            {/* Generate Button */}
            <Button
              id="generate-btn"
              variant="primary"
              size="lg"
              className="w-full font-bold text-base"
              isLoading={isGenerating && activeMode === "generate"}
              onClick={() => handleGenerate("generate")}
            >
              <TypeIcon className="w-4 h-4 mr-2" />
              {isGenerating && activeMode === "generate" ? "Generating..." : "Generate Content"}
            </Button>
          </div>

          {/* Right Panel — Result */}
          <div className="xl:col-span-3" ref={resultRef}>
            {isGenerating ? (
              <div className="h-full min-h-[400px] rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center gap-4 p-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  <Sparkles className="w-7 h-7 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-slate-200 mb-1">Generating your content...</p>
                  <p className="text-xs text-slate-400">
                    Crafting a {selectedType?.label || contentType} with {tone.toLowerCase()} tone
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                {/* Result Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-300">Generated • {result.model}</span>
                    <span className="text-xs text-slate-500">• {result.tokensUsed} tokens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="copy-output-btn"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      id="edit-toggle-btn"
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                    >
                      <PenTool className="w-3.5 h-3.5" /> {isEditing ? "Preview" : "Edit"}
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 space-y-4">
                  {/* Title */}
                  {isEditing ? (
                    <input
                      id="edit-title-input"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-indigo-500/40 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-white leading-snug">{editedTitle || result.title}</h2>
                  )}

                  {/* Content */}
                  {isEditing ? (
                    <textarea
                      id="edit-content-textarea"
                      rows={16}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-indigo-500/40 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none font-mono"
                    />
                  ) : (
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line max-h-[480px] overflow-y-auto pr-2">
                      {editedContent || result.content}
                    </div>
                  )}
                </div>

                {/* Result Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-800 bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <Button
                      id="regenerate-btn"
                      variant="outline"
                      size="sm"
                      isLoading={isGenerating && activeMode === "regenerate"}
                      onClick={() => handleGenerate("regenerate")}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Regenerate
                    </Button>
                    <Button
                      id="improve-btn"
                      variant="outline"
                      size="sm"
                      isLoading={isGenerating && activeMode === "improve"}
                      onClick={() => handleGenerate("improve")}
                    >
                      <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Improve
                    </Button>
                  </div>
                  <Button
                    id="save-btn"
                    variant="primary"
                    size="sm"
                    isLoading={saveStatus === "saving"}
                    onClick={handleSave}
                    disabled={saveStatus === "saved"}
                  >
                    {saveStatus === "saved" ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-300" /> Saved!</>
                    ) : (
                      <><Save className="w-3.5 h-3.5 mr-1.5" /> Save to Library</>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-4 p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-300 mb-1">Your content appears here</h3>
                  <p className="text-xs text-slate-500">
                    Select a content type, enter a topic, configure your options, then click <strong className="text-slate-400">Generate Content</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
  values,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  values?: string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all cursor-pointer"
        >
          {options.map((opt, i) => (
            <option key={i} value={values ? values[i] : opt.toLowerCase()}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
