"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RefreshCw,
  CheckCircle2,
  Calendar,
  Menu,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  Home,
} from "lucide-react";
import { useUI } from "@/context/UIContext";

const SHEET_NAMES_MAP: Record<string, { name: string; category: string }> = {
  // Active
  "namuna-8": { name: "नमुना ८ (कर आकारणी)", category: "कर आकारणी" },
  "namuna-8-khatedar": { name: "नमुना 8 खातेदार", category: "नोंदवह्या" },
  "namuna-9": { name: "नमुना ९ (कर मागणी)", category: "कर मागणी" },
  "namuna-9-goshavara": { name: "नमुना ९ गोषवारा", category: "नोंदवह्या" },
  "thakbaki-yadi-2026-27": { name: "थकबाकी यादी २०२६-२७", category: "कर वसुली" },
  "namuna-8-rates": { name: "न.८ साठीचे दर", category: "कर दर" },
  "all-mobile-no": { name: "all mobile no", category: "संपर्क यादी" },
  "utara": { name: "उतारा (A4 PDF)", category: "दस्तावेज" },
  "magani-bill": { name: "मागणी बिल (A4 PDF)", category: "दस्तावेज" },
  "namuna-10-pavati": { name: "नमुना १० पावती", category: "पावती" },
  "namuna-7-pavati": { name: "नमुना ७ पावती", category: "पावती" },
  "namuna-8-print-register": { name: "नमुना ८ प्रिंट रजिस्टर", category: "मुद्रण" },
  "namuna-9-print-register": { name: "नमुना ९ प्रिंट रजिस्टर", category: "मुद्रण" },
  "namuna-na-6": { name: "नमुना न. ६ (जमा नोंदवही)", category: "कॅशबुक" },
  "namuna-5-samanya": { name: "नमुना ५ सामान्य", category: "कॅशबुक" },
  "namuna-5-16-vitta": { name: "नमुना ५ १६ वित्त", category: "कॅशबुक" },
  "namuna-5-pani-purwatha": { name: "न.नं.५ पा. पु", category: "कॅशबुक" },
  "sheet1": { name: "Sheet1 (लेखाशीर्ष)", category: "खाते" },
  "masik-sabha-notice": { name: "मासिक सभा नोटीस", category: "प्रशासन" },
  // Historical
  "april": { name: "April (कॅशबुक)", category: "ऐतिहासिक" },
  "may": { name: "May (कॅशबुक)", category: "ऐतिहासिक" },
  "jun": { name: "Jun (कॅशबुक)", category: "ऐतिहासिक" },
  "july": { name: "July (कॅशबुक)", category: "ऐतिहासिक" },
  "aug": { name: "Aug (कॅशबुक)", category: "ऐतिहासिक" },
  "sep": { name: "Sep (कॅशबुक)", category: "ऐतिहासिक" },
  "oct": { name: "Oct (कॅशबुक)", category: "ऐतिहासिक" },
  "nov": { name: "Nov (कॅशबुक)", category: "ऐतिहासिक" },
  "dec": { name: "Dec (कॅशबुक)", category: "ऐतिहासिक" },
  "jan": { name: "Jan (कॅशबुक)", category: "ऐतिहासिक" },
  "feb": { name: "Feb (कॅशबुक)", category: "ऐतिहासिक" },
  "vasuli-report": { name: "वसुली रिपोर्ट", category: "ऐतिहासिक" },
  "vasuli-report-e": { name: "वसुली रिपोर्ट E", category: "ऐतिहासिक" },
  "namuna-5-yojana": { name: "न.नं.५ योजना", category: "ऐतिहासिक" },
  "namuna-5-general": { name: "न. नं. ५ GN", category: "ऐतिहासिक" },
};

export default function Header() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("आत्ताच");
  const { toggleSidebar, toggleGlobalSearch } = useUI();
  const pathname = usePathname();

  // Load last sync timestamp once on mount
  useEffect(() => {
    fetch("/api/sync")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.last_sync_timestamp) {
          const d = new Date(data.last_sync_timestamp);
          setLastSyncTime(
            d.toLocaleTimeString("mr-IN", { hour: "2-digit", minute: "2-digit" })
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: "two_way" }),
      });
      if (res.ok) {
        setLastSyncTime(
          new Date().toLocaleTimeString("mr-IN", { hour: "2-digit", minute: "2-digit" })
        );
      }
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Determine breadcrumb content
  let categoryLabel = "";
  let pageTitle = "मुख्य डॅशबोर्ड";

  if (pathname === "/") {
    pageTitle = "मुख्य डॅशबोर्ड";
  } else if (pathname === "/sync") {
    categoryLabel = "प्रशासन";
    pageTitle = "गुगल शीट्स सिंक्रोनायझेशन";
  } else if (pathname === "/settings") {
    categoryLabel = "प्रशासन";
    pageTitle = "प्रशासक सेटिंग्ज";
  } else if (pathname.startsWith("/sheets/")) {
    const slug = pathname.replace("/sheets/", "");
    const info = SHEET_NAMES_MAP[slug];
    if (info) {
      categoryLabel = info.category;
      pageTitle = info.name;
    } else {
      categoryLabel = "वर्कशीट";
      pageTitle = slug;
    }
  }

  return (
    <header className="h-14 border-b border-[#E6EAE5] bg-white px-4 md:px-6 flex items-center justify-between no-print z-10 shrink-0">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          aria-label="मेनू उघडा"
          className="md:hidden p-1.5 -ml-1.5 rounded-lg text-[#245C45] hover:bg-[#F7F8F5] focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Civic-Tech Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#68736C] min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[#245C45] transition-colors font-medium shrink-0"
          >
            <Home className="w-3.5 h-3.5 text-[#245C45]" />
            <span className="hidden sm:inline">गोहगाव</span>
          </Link>

          {categoryLabel && (
            <>
              <ChevronRight className="w-3 h-3 text-[#9DA39F] shrink-0" />
              <span className="hidden md:inline text-[#68736C] font-normal shrink-0">
                {categoryLabel}
              </span>
            </>
          )}

          <ChevronRight className="w-3 h-3 text-[#9DA39F] shrink-0" />
          <h1 className="text-xs sm:text-sm font-semibold text-[#202923] truncate">
            {pageTitle}
          </h1>
        </nav>
      </div>

      {/* Center/Right: Global Search, Live Sync & Admin Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Global Search Trigger Button */}
        <button
          onClick={toggleGlobalSearch}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#F7F8F5] hover:bg-[#EAF1EC] text-[#68736C] hover:text-[#245C45] border border-[#E6EAE5] transition-all text-xs group"
          title="शीट्स व सेवा शोधा (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-[#68736C] group-hover:text-[#245C45]" />
          <span className="hidden md:inline font-medium">शोधा...</span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-white text-[#68736C] border border-[#E6EAE5] rounded shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Financial Year Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7F8F5] border border-[#E6EAE5] text-xs text-[#202923]">
          <Calendar className="w-3.5 h-3.5 text-[#245C45]" />
          <span>सन <strong>२०२६-२७</strong></span>
        </div>

        {/* Google Sheet Live Status Link */}
        <a
          href="https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF1EC] text-[#245C45] hover:bg-[#dfece3] transition-colors text-xs font-medium border border-[#cfe2d6]"
          title="Google Sheets कनेक्टेड आहे. उघडण्यासाठी क्लिक करा."
        >
          <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
          <span className="hidden md:inline">Google Sheets</span>
          <ExternalLink className="w-3 h-3 text-[#245C45]" />
        </a>

        {/* Manual Sync Button */}
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#245C45] text-white hover:bg-[#1D4B38] transition-colors text-xs font-medium shadow-xs disabled:opacity-70"
          title={`शेवटचा सिंक: ${lastSyncTime}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span className="hidden xs:inline">{isSyncing ? "सिंक..." : "सिंक करा"}</span>
        </button>

        {/* Admin Avatar & Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E6EAE5]">
          <div
            className="w-8 h-8 rounded-full bg-[#EAF1EC] text-[#245C45] flex items-center justify-center font-bold text-xs border border-[#245C45]/20 shadow-2xs"
            title="ग्रामपंचायत गोहगाव प्रशासक"
          >
            ग
          </div>
          <div className="hidden lg:block text-left text-xs leading-tight">
            <span className="font-semibold text-[#202923] block">प्रशासक</span>
            <span className="text-[10px] text-[#68736C]">गोहगाव</span>
          </div>
        </div>
      </div>
    </header>
  );
}
