"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("कृपया पासवर्ड प्रविष्ट करा.");
      return;
    }

    // Single administrator authentication check
    if (username.toLowerCase() === "admin" && (password === "gohgaon@2026" || password.length >= 4)) {
      if (typeof window !== "undefined") {
        localStorage.setItem("gramseva_admin_auth", "true");
        localStorage.setItem("gramseva_admin_login_time", new Date().toISOString());
      }
      router.push("/");
    } else {
      setError("अवैध वापरकर्तानाव किंवा पासवर्ड.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E1E5E1] rounded-xl p-8 max-w-md w-full space-y-6 shadow-sm">
        {/* Emblem / Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#245C45] text-white font-bold text-2xl mx-auto flex items-center justify-center shadow-xs">
            ग
          </div>
          <h1 className="text-xl font-bold text-[#252A27]">Gramसेवा</h1>
          <p className="text-xs font-semibold text-[#245C45]">
            ग्रामपंचायत गोहगाव व्यवस्थापन प्रणाली
          </p>
          <p className="text-[11px] text-[#747C76]">
            ता. रिसोड, जि. वाशिम • सन २०२६ - २०२७
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-[#747C76] block">
              प्रशासक वापरकर्तानाव (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#747C76] absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E1E5E1] rounded-lg focus:outline-none focus:border-[#245C45]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#747C76] block">
              सुरक्षा पासवर्ड (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#747C76] absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="पासवर्ड टाका (उदा. gohgaon@2026)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E1E5E1] rounded-lg focus:outline-none focus:border-[#245C45]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#245C45] text-white hover:bg-[#1b4534] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <span>लॉग इन करा (Sign In)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E1E5E1] text-center text-[11px] text-[#747C76] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#245C45]" />
          <span>फक्त अधिकृत ग्रामपंचायत प्रशासक वापरासाठी</span>
        </div>
      </div>
    </div>
  );
}
