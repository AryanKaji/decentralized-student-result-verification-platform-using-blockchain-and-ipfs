"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, GraduationCap, Mail, Lock } from "lucide-react";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  async function submit(data: any) {
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (!res?.ok) {
      alert("Invalid credentials");
      return;
    }

    const session = await fetch("/api/auth/session").then((r) => r.json());
    if (session?.user?.role === "admin") {
      window.location.href = "/admin";
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col items-center justify-center p-6">
      {/* Top Corner See Result Button */}
      <div className="absolute top-6 right-6">
        <a
          href="/result"
          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 px-4 py-2.5 rounded-xl text-xs font-bold transition border border-slate-200 shadow-xs cursor-pointer"
        >
          See Result
        </a>
      </div>

      {/* University Logo Header */}
      <div className="flex flex-col items-center gap-3 mb-8 text-center">
        <div className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg">
          <GraduationCap className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">ABC University</h1>
          <p className="text-xs text-indigo-600 font-bold tracking-wider uppercase mt-0.5">Secure Portal Access</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full transition duration-150 hover:shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign In</h2>
          <p className="text-sm text-slate-450 mt-1">
            Access your secure portal to submit grades or publish cryptographic certificates.
          </p>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="email"
                placeholder="teacher@abc.edu"
                {...register("email")}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium transition placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium transition placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white"
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white w-full py-3.5 rounded-xl text-sm font-semibold transition duration-150 shadow-md shadow-indigo-500/10 cursor-pointer mt-2">
            Sign In to Portal
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-slate-400 font-mono">
          Powered by ABC University Decentralized Registry Platform
        </p>
      </div>
    </div>
  );
}
