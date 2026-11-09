"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RefreshCw, CheckCircle2, Shield, ExternalLink, Calendar, Menu } from "lucide-react";
import { useUI } from "@/context/UIContext";

export default function Header() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("आत्ताच");
  const { toggleSidebar } = useUI();

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: "two_way" }),
      });
      const data = await res.json();
      if (res.ok) {
        setLastSync(new Date().toLocaleTimeString("mr-IN"));
      }
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="h-14 border-b border-[#E1E5E1] bg-white px-4 md:px-6 flex items-center justify-between no-print z-10 shrink-0">
      {/* Title & Panchayat Breadcrumb with Mobile Menu Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleSidebar}
          aria-label="मेनू उघडा"
          className="md:hidden p-1.5 rounded text-[#245C45] hover:bg-[#F6F7F5] focus:outline-none focus:ring-1 focus:ring-[#245C45]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm font-semibold text-[#252A27] truncate">
            ग्रामपंचायत कार्यालय, गोहगाव
          </h1>
          <p className="text-[11px] text-[#747C76] hidden sm:block">
            ता. रिसोड, जि. वाशिम • महाराष्ट्र शासन
          </p>
        </div>
      </div>

      {/* Center/Right Status Indicators & Actions */}
      <div className="flex items-center gap-4">
        {/* Financial Year Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F6F7F5] border border-[#E1E5E1] text-xs text-[#252A27]">
          <Calendar className="w-3.5 h-3.5 text-[#245C45]" />
          <span>आर्थिक वर्ष: <strong>२०२६-२७</strong></span>
        </div>

        {/* Google Sheets Connection Pill */}
        <a
          href="https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EAF1EC] text-[#245C45] hover:bg-[#dce9df] transition-colors text-xs font-medium border border-[#cbe0d3]"
          title="मूळ गुगल स्प्रेडशीट उघडा"
        >
          <div className="w-2 h-2 rounded-full bg-[#2E7D32]" />
          <span>गुगल शीट्स कनेक्टेड</span>
          <ExternalLink className="w-3 h-3 text-[#245C45]" />
        </a>

        {/* Manual Sync Button */}
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#245C45] text-white hover:bg-[#1b4534] transition-colors text-xs font-medium shadow-sm disabled:opacity-75"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "सिंक होत आहे..." : "सिंक करा"}</span>
        </button>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E1E5E1]">
          <div className="w-7 h-7 rounded-full bg-[#EAF1EC] text-[#245C45] flex items-center justify-center font-bold text-xs border border-[#245C45]">
            A
          </div>
          <div className="hidden md:block text-left text-xs">
            <span className="font-semibold text-[#252A27] block">प्रशासक</span>
          </div>
        </div>
      </div>
    </header>
  );
}
