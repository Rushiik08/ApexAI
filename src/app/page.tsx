"use client";

import React, { useState } from "react";

const CURRENT_YEAR = 2026;
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  FileText,
  Share2,
  Mail,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const [copied, setCopied] = useState(false);
  const [selectedDemoType, setSelectedDemoType] = useState("blog");

  const demoOutputs: Record<string, { title: string; content: string }> = {
    blog: {
      title: "How Autonomous AI Agents Are Transforming Software Engineering",
      content:
        "The software development landscape is undergoing a monumental shift. Autonomous coding agents are no longer just predictive text engines; they are proactive pair-programmers capable of inspecting entire repositories, orchestrating database migrations, and executing rigorous QA test suites.\n\n### 1. Context-Aware Architecture\nModern AI agents read the full AST and dependency graph of your application before proposing modifications. This minimizes regression risks and preserves architectural integrity.\n\n### 2. Autonomous Verification\nInstead of blindly suggesting snippets, agents write unit tests, verify builds, and rectify compiler errors in isolated environments.",
    },
    social: {
      title: "Viral LinkedIn Post on Engineering Productivity",
      content:
        "🚀 We reduced our SaaS feature release cycle from 2 weeks to 2 hours.\n\nHere's the 3-step playbook our engineering team followed:\n\n1. AI-assisted boilerplate generation\n2. Automated schema-to-API contract generation\n3. Zero-touch end-to-end regression validation\n\nSpeed isn't about rushing code—it's about removing bureaucratic friction.\n\n👉 What workflow bottlenecks are you automating this quarter? #SoftwareEngineering #AI #SaaS #Productivity",
    },
    marketing: {
      title: "High-Converting Hero Section Pitch",
      content:
        "**Headline:** Generate Production-Ready Content in Seconds, Not Hours.\n\n**Subheadline:** Empower your team with an enterprise-grade AI content studio. From technical documentation to viral campaigns, ApexAI scales your output without sacrificing your brand's unique voice.\n\n**Primary CTA:** Start Your 14-Day Free Trial (No Credit Card Required)\n**Secondary CTA:** Watch Interactive Walkthrough (2 mins)",
    },
    email: {
      title: "Product Launch Announcement Email",
      content:
        "**Subject:** Introducing ApexAI 2.0: Instant, Intelligent Content Creation\n\nHi [First Name],\n\nWe're thrilled to officially unveil ApexAI 2.0—engineered from the ground up to help modern teams create, refine, and organize world-class content with unprecedented speed.\n\n**What's new in 2.0:**\n• Multi-provider AI intelligence (OpenAI, Groq & Gemini)\n• Direct database persistence with PostgreSQL & NeonDB\n• Granular tone, audience, and length personalization\n\n[Claim Your Free Account Now →]\n\nBest regards,\nThe ApexAI Team",
    },
  };

  const currentDemo = demoOutputs[selectedDemoType] || demoOutputs.blog;

  const handleCopyDemo = () => {
    navigator.clipboard.writeText(`${currentDemo.title}\n\n${currentDemo.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Content Architecture
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Create High-Impact Content with{" "}
            <span className="text-gradient">Precision AI</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The all-in-one AI SaaS workspace. Generate blog articles, marketing copy, social posts, and product descriptions powered by leading LLMs and stored securely on Neon PostgreSQL.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-4 font-semibold shadow-xl shadow-indigo-600/25">
                Start Creating Free <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-4">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PostgreSQL & NeonDB
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-LLM Support
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Showcase */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Experience the Generation Engine</h2>
            <p className="text-sm text-slate-400 mt-2">
              Select a content format below to see sample output produced by our fine-tuned AI prompts.
            </p>
          </div>

          {/* Type Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {[
              { id: "blog", label: "Blog Post", icon: FileText },
              { id: "social", label: "Social Media", icon: Share2 },
              { id: "marketing", label: "Marketing Copy", icon: TrendingUp },
              { id: "email", label: "Email Campaign", icon: Mail },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedDemoType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDemoType(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Preview Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">apex-engine-v2.output</span>
              </div>
              <button
                onClick={handleCopyDemo}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Output"}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">{currentDemo.title}</h3>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {currentDemo.content}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Production ready • 100% editable • Auto-saved to database
              </div>
              <Link href="/workspace">
                <Button size="sm" variant="primary">
                  Open in Workspace <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Modern Content Teams
          </h2>
          <p className="text-slate-400 mt-4 text-base">
            Every feature is backed by real server-side infrastructure, typed validations, and high-performance database indexing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-LLM Abstraction</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Seamlessly swap between OpenAI, Groq, or Google Gemini with a single environment variable change. Zero lock-in.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Isolated PostgreSQL Storage</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your generated content is indexed and secured via NeonDB PostgreSQL and Prisma ORM. Strict multi-tenant isolation ensures total data privacy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/30 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fine-Tuned Persona Controls</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Customize tone, target audience, target length, and output language. Regenerate or polish existing drafts in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Simple, Transparent Pricing</h2>
            <p className="text-sm text-slate-400 mt-3">Start with our free tier and scale as your content requirements grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="rounded-2xl p-8 bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-400 mt-1">Perfect for individual creators</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <ul className="mt-8 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 50 AI generations / mo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standard LLM models
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full generation history
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Markdown copy & export
                  </li>
                </ul>
              </div>
              <Link href="/register" className="mt-8 block">
                <Button variant="outline" size="sm" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl p-8 bg-gradient-to-b from-slate-900 to-indigo-950/40 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/10 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-[11px] font-bold text-white uppercase tracking-wider rounded-full shadow-md">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Pro Creator</h3>
                <p className="text-xs text-slate-400 mt-1">For power users and marketers</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$29</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <ul className="mt-8 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> 1,000 AI generations / mo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> High-speed inference (Groq/GPT-4o)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Advanced tone & audience presets
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Priority support & telemetry
                  </li>
                </ul>
              </div>
              <Link href="/register" className="mt-8 block">
                <Button variant="primary" size="sm" className="w-full">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-2xl p-8 bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1">For agencies & scaleups</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$99</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <ul className="mt-8 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited AI generations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom fine-tuned models
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated database branch
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SLA & 24/7 account manager
                  </li>
                </ul>
              </div>
              <Link href="/register" className="mt-8 block">
                <Button variant="outline" size="sm" className="w-full">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">ApexAI Platform</span> — Production SaaS Architecture
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Sign Up
            </Link>
            <Link href="/workspace" className="hover:text-white transition-colors">
              Workspace
            </Link>
          </div>
          <div>© {CURRENT_YEAR} ApexAI. Built for high performance and security.</div>
        </div>
      </footer>
    </div>
  );
}
