"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Building2,
  KeyRound,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setError("कृपया वापरकर्तानाव (Username) प्रविष्ट करा.");
      return;
    }

    if (!password) {
      setError("कृपया पासवर्ड (Password) प्रविष्ट करा.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUser,
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "अवैध वापरकर्तानाव किंवा पासवर्ड.");
        setIsLoading(false);
        return;
      }

      // Successful server authentication: session cookie is set via HTTP-only
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError("सर्व्हरशी संपर्क साधता आला नाही. कृपया इंटरनेट तपासा.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md bg-white border border-[#E6EAE5] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Emblem & Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#245C45] text-white font-bold text-xl mx-auto flex items-center justify-center shadow-xs">
            ग
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-lg font-bold text-[#202923] tracking-tight">Gramसेवा</span>
              <span className="text-[10px] bg-[#EAF1EC] text-[#245C45] font-semibold px-1.5 py-0.5 rounded border border-[#245C45]/15">
                गोहगाव
              </span>
            </div>
            <p className="text-xs text-[#68736C] font-medium">
              ग्रामपंचायत कार्यालय, ता. रिसोड, जि. वाशिम
            </p>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="text-center border-t border-[#E6EAE5] pt-4">
          <h2 className="text-xl font-bold text-[#202923] tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-[#68736C] mt-0.5">
            प्रशासक खात्यामध्ये सुरक्षित लॉगिन करा
          </p>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#202923] block">
              वापरकर्तानाव (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#68736C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="वापरकर्तानाव प्रविष्ट करा"
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6EAE5] rounded-xl text-xs text-[#202923] placeholder-[#9DA39F] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20 disabled:bg-[#F7F8F5] transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#202923] block">
              सुरक्षा पासवर्ड (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#68736C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड प्रविष्ट करा"
                disabled={isLoading}
                className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#E6EAE5] rounded-xl text-xs text-[#202923] placeholder-[#9DA39F] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20 disabled:bg-[#F7F8F5] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "पासवर्ड लपवा" : "पासवर्ड दाखवा"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#68736C] hover:text-[#202923] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E6EAE5] text-[#245C45] focus:ring-[#245C45]/20 accent-[#245C45]"
              />
              <span className="text-xs text-[#68736C] font-medium">
                लॉगिन सेव्ह ठेवा (Remember me)
              </span>
            </label>
            <span className="text-[11px] text-[#9DA39F]">सन २०२६-२७</span>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 rounded-xl bg-[#245C45] text-white hover:bg-[#1D4B38] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>पडताळणी चालू आहे...</span>
              </>
            ) : (
              <>
                <span>लॉग इन करा (Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="pt-4 border-t border-[#E6EAE5] text-center space-y-1 text-[11px] text-[#68736C]">
          <div className="flex items-center justify-center gap-1.5 font-medium text-[#245C45]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>सुरक्षित प्रशासकीय 256-bit सत्र</span>
          </div>
          <p className="text-[#9DA39F]">
            फक्त अधिकृत ग्रामसेवक / प्रशासक वापरासाठी राखीव
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#245C45]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
