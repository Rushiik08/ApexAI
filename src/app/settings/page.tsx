"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Settings, User, Shield, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  plan: string;
  monthlyGenerationsLimit: number;
  createdAt: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setName(data.user.name || "");
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setProfileMsg({ type: "error", text: "Name cannot be empty." }); return; }
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setProfileMsg({ type: "error", text: data.error || "Update failed." }); return; }
      setUser((prev) => prev ? { ...prev, name: name.trim() } : prev);
      setProfileMsg({ type: "success", text: "Profile updated successfully." });
    } catch {
      setProfileMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setPasswordMsg({ type: "error", text: data.error || "Password change failed." }); return; }
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
    } catch {
      setPasswordMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-slate-400" />
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-sm text-slate-400">Manage your account, profile, and security settings.</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Account Info Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-lg">
                  {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{user?.name || "User"}</p>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {user?.plan || "Free"} Plan
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {user?.monthlyGenerationsLimit} generations/month
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                  <p className="text-slate-400 mb-1">Account ID</p>
                  <p className="text-slate-200 font-mono truncate">{user?.id}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                  <p className="text-slate-400 mb-1">Member Since</p>
                  <p className="text-slate-200">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—"}</p>
                </div>
              </div>
            </div>

            {/* Profile Settings */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Profile Details</h2>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="settings-email" className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                  <input
                    id="settings-email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 text-sm cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Email address cannot be changed.</p>
                </div>
                <div>
                  <label htmlFor="settings-name" className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name</label>
                  <input
                    id="settings-name"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setProfileMsg(null); }}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
                  />
                </div>
                {profileMsg && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium ${profileMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                    {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {profileMsg.text}
                  </div>
                )}
                <Button id="save-profile-btn" type="submit" variant="primary" size="sm" isLoading={isSavingProfile} className="w-full sm:w-auto">
                  Save Profile
                </Button>
              </form>
            </div>

            {/* Change Password */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 mb-5">
                <Shield className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-bold text-white">Change Password</h2>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="settings-current-pw" className="block text-xs font-semibold text-slate-300 mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      id="settings-current-pw"
                      type={showCurrentPw ? "text" : "password"}
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => { setCurrentPassword(e.target.value); setPasswordMsg(null); }}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="settings-new-pw" className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      id="settings-new-pw"
                      type={showNewPw ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(null); }}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {passwordMsg && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium ${passwordMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                    {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {passwordMsg.text}
                  </div>
                )}
                <Button id="change-password-btn" type="submit" variant="secondary" size="sm" isLoading={isSavingPassword} className="w-full sm:w-auto">
                  Update Password
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
