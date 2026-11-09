"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RefreshCw, CheckCircle2, Shield, ExternalLink, Calendar } from "lucide-react";

export default function Header() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("आत्ताच");

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date().toLocaleTimeString("mr-IN"));
    }, 1200);
  };

  return (
    <header className="h-14 border-b border-[#E1E5E1] bg-white px-6 flex items-center justify-between no-print z-10 shrink-0">
      {/* Title & Panchayat Breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-[#252A27]">
            ग्रामपंचायत कार्यालय, गोहगाव
          </h1>
          <p className="text-[11px] text-[#747C76]">
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
