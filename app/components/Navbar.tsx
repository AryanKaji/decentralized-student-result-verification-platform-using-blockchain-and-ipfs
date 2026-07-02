"use client";

import { useState } from "react";
import { LogOut, Mail, BookOpen, User, GraduationCap, AlertTriangle } from "lucide-react";

import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [showConfirm, setShowConfirm] = useState(false);

  if (status === "loading") return null;

  if (!session) return null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 tracking-tight">ABC University</h1>
              <p className="text-[10px] text-indigo-650 font-bold tracking-wider uppercase">
                {session.user?.role === "admin" ? "Admin Registry" : "Teacher Portal"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* User Profile Pill */}
            <div className="flex items-center gap-3 bg-slate-50/50 border border-slate-200/80 pl-3 pr-4 py-1.5 rounded-2xl">
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl border border-indigo-100/50">
                <User className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-slate-800 leading-tight">
                  {session.user?.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-medium">
                  <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>{session.user?.email}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-indigo-650 font-semibold uppercase tracking-wider">
                  <BookOpen className="h-3 w-3 shrink-0" />
                  <span>
                    {typeof session.user?.subject === "string"
                      ? session.user.subject
                      : "Admin"}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 px-4 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Dialog Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-6 animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Confirm Logout</h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to sign out of your account? You will need to log back in to access the portal.
            </p>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 px-4.5 py-2 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowConfirm(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white px-5 py-2 text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
