"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  FileSpreadsheet,
  Receipt,
  Users,
  CalendarDays,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

interface SheetNav {
  slug: string;
  name: string;
  badge?: string;
  isMonthly?: boolean;
}

const taxAndAssessmentSheets: SheetNav[] = [
  { slug: "namuna-8", name: "नमुना ८", badge: "८०३ नोंदी" },
  { slug: "namuna-9", name: "नमुना ९ ", badge: "७०७ मागण्या" },
  { slug: "namuna-8-rates", name: "न.८ साठीचे दर" },
  { slug: "all-mobile-no", name: "all mobile no", badge: "६८० संपर्क" },
];

const documentSheets: SheetNav[] = [
  { slug: "utara", name: "उतारा (A4 PDF)" },
  { slug: "magani-bill", name: "मागणी बिल (A4 PDF)" },
  { slug: "namuna-10-pavati", name: "नमुना १० पावती" },
  { slug: "namuna-7-pavati", name: "नमुना ७ पावती" },
];

const cashbookSheets: SheetNav[] = [
  { slug: "namuna-5-general", name: "न. नं. ५ GN" },
  { slug: "namuna-5-pani-purwatha", name: "न.नं.५ पा. पु" },
  { slug: "namuna-5-yojana", name: "न.नं.५ योजना" },
  { slug: "sheet1", name: "Sheet1 (लेखाशीर्ष)" },
];

const monthlySheets: SheetNav[] = [
  { slug: "april", name: "April" },
  { slug: "may", name: "May" },
  { slug: "jun", name: "Jun" },
  { slug: "july", name: "July" },
  { slug: "aug", name: "Aug" },
  { slug: "sep", name: "Sep" },
  { slug: "oct", name: "Oct" },
  { slug: "nov", name: "Nov" },
  { slug: "dec", name: "Dec" },
  { slug: "jan", name: "Jan" },
  { slug: "feb", name: "Feb" },
];

const reportAndNoticeSheets: SheetNav[] = [
  { slug: "vasuli-report", name: "वसुली रिपोर्ट" },
  { slug: "vasuli-report-e", name: "वसुली रिपोर्ट E" },
  { slug: "masik-sabha-notice", name: "मासिक सभा नोटीस", badge: "९ सदस्य" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [monthlyOpen, setMonthlyOpen] = useState(false);

  const isActive = (slug: string) => {
    return pathname === `/sheets/${slug}`;
  };

  return (
    <aside className="w-72 bg-white border-r border-[#E1E5E1] flex flex-col h-screen select-none shrink-0 overflow-hidden no-print">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#E1E5E1] bg-[#FFFFFF]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-[#245C45] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            ग
          </div>
          <div>
            <div className="font-bold text-base text-[#252A27] tracking-tight flex items-center gap-1.5">
              <span>Gramसेवा</span>
              <span className="text-[10px] bg-[#EAF1EC] text-[#245C45] font-semibold px-1.5 py-0.5 rounded">
                गोहगाव
              </span>
            </div>
            <p className="text-xs text-[#747C76] font-medium">ग्रा.पं. व्यवस्थापन प्रणाली</p>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">
        {/* Dashboard */}
        <div>
          <Link
            href="/"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
              pathname === "/"
                ? "bg-[#EAF1EC] text-[#245C45] font-semibold border-l-4 border-[#245C45]"
                : "text-[#252A27] hover:bg-[#F6F7F5]"
            }`}
          >
            <Landmark className="w-4 h-4 text-[#245C45]" />
            <span>मुख्य डॅशबोर्ड</span>
          </Link>
        </div>

        {/* Section 1: Property & Assessment */}
        <div>
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#747C76]">
            मालमत्ता व कर आकारणी
          </div>
          <div className="space-y-0.5 mt-1">
            {taxAndAssessmentSheets.map((s) => (
              <Link
                key={s.slug}
                href={`/sheets/${s.slug}`}
                className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                  isActive(s.slug)
                    ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                    : "text-[#252A27] hover:bg-[#F6F7F5]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#747C76]" />
                  <span>{s.name}</span>
                </div>
                {s.badge && (
                  <span className="text-[10px] bg-[#F0F2EF] text-[#747C76] px-1.5 py-0.5 rounded font-mono">
                    {s.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Section 2: Statutory Documents & Printing */}
        <div>
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#747C76]">
            दस्तावेज व प्रिंटिंग
          </div>
          <div className="space-y-0.5 mt-1">
            {documentSheets.map((s) => (
              <Link
                key={s.slug}
                href={`/sheets/${s.slug}`}
                className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                  isActive(s.slug)
                    ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                    : "text-[#252A27] hover:bg-[#F6F7F5]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#747C76]" />
                  <span>{s.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 3: Cashbooks (Namuna 5) */}
        <div>
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#747C76]">
            कॅशबुक (नमुना ५)
          </div>
          <div className="space-y-0.5 mt-1">
            {cashbookSheets.map((s) => (
              <Link
                key={s.slug}
                href={`/sheets/${s.slug}`}
                className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                  isActive(s.slug)
                    ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                    : "text-[#252A27] hover:bg-[#F6F7F5]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#747C76]" />
                  <span>{s.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 4: Monthly Accounts (Namuna 6) */}
        <div>
          <button
            onClick={() => setMonthlyOpen(!monthlyOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] text-[#252A27] hover:bg-[#F6F7F5] font-medium"
          >
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-4 h-4 text-[#747C76]" />
              <span>मासिक खाती (April - Feb)</span>
            </div>
            {monthlyOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#747C76]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#747C76]" />
            )}
          </button>

          {monthlyOpen && (
            <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-[#E1E5E1] ml-4 mt-1">
              {monthlySheets.map((s) => (
                <Link
                  key={s.slug}
                  href={`/sheets/${s.slug}`}
                  className={`block px-2.5 py-1 rounded text-xs transition-colors ${
                    isActive(s.slug)
                      ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                      : "text-[#747C76] hover:text-[#252A27] hover:bg-[#F6F7F5]"
                  }`}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Reports & Meetings */}
        <div>
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#747C76]">
            अहवाल व मासिक सभा
          </div>
          <div className="space-y-0.5 mt-1">
            {reportAndNoticeSheets.map((s) => (
              <Link
                key={s.slug}
                href={`/sheets/${s.slug}`}
                className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                  isActive(s.slug)
                    ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                    : "text-[#252A27] hover:bg-[#F6F7F5]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-[#747C76]" />
                  <span>{s.name}</span>
                </div>
                {s.badge && (
                  <span className="text-[10px] bg-[#EAF1EC] text-[#245C45] px-1.5 py-0.5 rounded font-medium">
                    {s.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Section 6: Sync & Settings */}
        <div>
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#747C76]">
            व्यवस्थापन
          </div>
          <div className="space-y-0.5 mt-1">
            <Link
              href="/sync"
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                pathname === "/sync"
                  ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                  : "text-[#252A27] hover:bg-[#F6F7F5]"
              }`}
            >
              <RefreshCw className="w-4 h-4 text-[#245C45]" />
              <span>गुगल शीट्स सिंक्रोनायझेशन</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                pathname === "/settings"
                  ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                  : "text-[#252A27] hover:bg-[#F6F7F5]"
              }`}
            >
              <Settings className="w-4 h-4 text-[#747C76]" />
              <span>प्रशासक सेटिंग्ज</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#E1E5E1] bg-[#F6F7F5] text-xs text-[#747C76] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2E7D32]" />
          <span className="font-medium text-[#252A27]">प्रशासक लॉग इन</span>
        </div>
        <span className="font-mono text-[11px]">सन २०२६-२७</span>
      </div>
    </aside>
  );
}
