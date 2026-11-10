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
  Printer,
  Archive,
  X,
} from "lucide-react";
import { useUI } from "@/context/UIContext";

interface SheetNav {
  slug: string;
  name: string;
  badge?: string;
}

// 1. कर आकारणी व खातेदार नोंदवह्या (Tax & Khatedar Assessment)
const taxAndAssessmentSheets: SheetNav[] = [
  { slug: "namuna-8", name: "नमुना ८ (कर आकारणी)", badge: "१२५० नोंदी" },
  { slug: "namuna-8-khatedar", name: "नमुना 8 खातेदार", badge: "६८२ खातेदार" },
  { slug: "namuna-9", name: "नमुना ९ (कर मागणी)", badge: "१००० मागण्या" },
  { slug: "namuna-9-goshavara", name: "नमुना ९ गोषवारा", badge: "पाननिहाय" },
  { slug: "thakbaki-yadi-2026-27", name: "थकबाकी यादी २०२६-२७", badge: "७१२ बाकी" },
  { slug: "namuna-8-rates", name: "न.८ साठीचे दर", badge: "५२८ दर" },
  { slug: "all-mobile-no", name: "all mobile no", badge: "७५७ संपर्क" },
];

// 2. कायदेशीर दस्तावेज व पावत्या (Statutory Documents & Receipts)
const documentSheets: SheetNav[] = [
  { slug: "utara", name: "उतारा (A4 PDF)" },
  { slug: "magani-bill", name: "मागणी बिल (A4 PDF)" },
  { slug: "namuna-10-pavati", name: "नमुना १० पावती" },
  { slug: "namuna-7-pavati", name: "नमुना ७ पावती" },
];

// 3. अधिकृत मुद्रण रजिस्टर्स (Printable A4 Registers)
const printRegisters: SheetNav[] = [
  { slug: "namuna-8-print-register", name: "नमुना ८ प्रिंट रजिस्टर", badge: "A4 मुद्रण" },
  { slug: "namuna-9-print-register", name: "नमुना ९ प्रिंट रजिस्टर", badge: "A4 मुद्रण" },
];

// 4. कॅशबुक व जमा नोंदवही (Cashbooks & Accounts)
const cashbookSheets: SheetNav[] = [
  { slug: "namuna-na-6", name: "नमुना न. ६ (जमा नोंदवही)", badge: "७८ नोंदी" },
  { slug: "namuna-5-samanya", name: "नमुना ५ सामान्य", badge: "२९ नोंदी" },
  { slug: "namuna-5-16-vitta", name: "नमुना ५ १६ वित्त", badge: "२२ नोंदी" },
  { slug: "namuna-5-pani-purwatha", name: "न.नं.५ पा. पु", badge: "२९ नोंदी" },
  { slug: "sheet1", name: "Sheet1 (लेखाशीर्ष)" },
];

// 5. प्रशासन व मासिक सभा (Governance & Notice)
const governanceSheets: SheetNav[] = [
  { slug: "masik-sabha-notice", name: "मासिक सभा नोटीस", badge: "१३ सदस्य" },
];

// 6. ऐतिहासिक अभिलेख (Archived / Historical Records)
const archivedSheets: SheetNav[] = [
  { slug: "april", name: "April (ऐतिहासिक कॅशबुक)" },
  { slug: "may", name: "May (ऐतिहासिक कॅशबुक)" },
  { slug: "jun", name: "Jun (ऐतिहासिक कॅशबुक)" },
  { slug: "july", name: "July (ऐतिहासिक कॅशबुक)" },
  { slug: "aug", name: "Aug (ऐतिहासिक कॅशबुक)" },
  { slug: "sep", name: "Sep (ऐतिहासिक कॅशबुक)" },
  { slug: "oct", name: "Oct (ऐतिहासिक कॅशबुक)" },
  { slug: "nov", name: "Nov (ऐतिहासिक कॅशबुक)" },
  { slug: "dec", name: "Dec (ऐतिहासिक कॅशबुक)" },
  { slug: "jan", name: "Jan (ऐतिहासिक कॅशबुक)" },
  { slug: "feb", name: "Feb (ऐतिहासिक कॅशबुक)" },
  { slug: "vasuli-report", name: "वसुली रिपोर्ट (ऐतिहासिक)" },
  { slug: "vasuli-report-e", name: "वसुली रिपोर्ट E (ऐतिहासिक)" },
  { slug: "namuna-5-yojana", name: "न.नं.५ योजना (मागील)" },
  { slug: "namuna-5-general", name: "न. नं. ५ GN (मागील)" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const { sidebarOpen, closeSidebar } = useUI();

  const isActive = (slug: string) => {
    return pathname === `/sheets/${slug}`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 w-72 bg-white border-r border-[#E1E5E1] flex flex-col h-screen select-none shrink-0 overflow-hidden no-print transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E1E5E1] bg-[#FFFFFF] flex items-center justify-between">
          <Link href="/" onClick={closeSidebar} className="flex items-center gap-3 group">
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

          <button
            onClick={closeSidebar}
            className="md:hidden p-1.5 rounded-md text-[#747C76] hover:bg-[#F6F7F5] hover:text-[#252A27] transition-colors"
            aria-label="मेनू बंद करा"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">
          {/* Dashboard */}
          <div>
            <Link
              href="/"
              onClick={closeSidebar}
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
              मालमत्ता व कर आकारणी (१९ शीट्स)
            </div>
            <div className="space-y-0.5 mt-1">
              {taxAndAssessmentSheets.map((s) => (
                <Link
                  key={s.slug}
                  href={`/sheets/${s.slug}`}
                  onClick={closeSidebar}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                    isActive(s.slug)
                      ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                      : "text-[#252A27] hover:bg-[#F6F7F5]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileSpreadsheet className="w-4 h-4 text-[#747C76] shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </div>
                  {s.badge && (
                    <span className="text-[10px] bg-[#F0F2EF] text-[#747C76] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
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
              दस्तावेज व पावत्या
            </div>
            <div className="space-y-0.5 mt-1">
              {documentSheets.map((s) => (
                <Link
                  key={s.slug}
                  href={`/sheets/${s.slug}`}
                  onClick={closeSidebar}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                    isActive(s.slug)
                      ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                      : "text-[#252A27] hover:bg-[#F6F7F5]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-[#747C76] shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Section 3: Official Printable Registers */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#747C76]">
              मुद्रण रजिस्टर्स (A4 Registers)
            </div>
            <div className="space-y-0.5 mt-1">
              {printRegisters.map((s) => (
                <Link
                  key={s.slug}
                  href={`/sheets/${s.slug}`}
                  onClick={closeSidebar}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                    isActive(s.slug)
                      ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                      : "text-[#252A27] hover:bg-[#F6F7F5]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Printer className="w-4 h-4 text-[#245C45] shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </div>
                  {s.badge && (
                    <span className="text-[10px] bg-[#EAF1EC] text-[#245C45] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
                      {s.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Section 4: Cashbooks & Accounts */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#747C76]">
              कॅशबुक व जमा नोंदवही
            </div>
            <div className="space-y-0.5 mt-1">
              {cashbookSheets.map((s) => (
                <Link
                  key={s.slug}
                  href={`/sheets/${s.slug}`}
                  onClick={closeSidebar}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                    isActive(s.slug)
                      ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                      : "text-[#252A27] hover:bg-[#F6F7F5]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <BookOpen className="w-4 h-4 text-[#747C76] shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </div>
                  {s.badge && (
                    <span className="text-[10px] bg-[#F0F2EF] text-[#747C76] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
                      {s.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Section 5: Governance & Meeting Notice */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#747C76]">
              प्रशासन व मासिक सभा
            </div>
            <div className="space-y-0.5 mt-1">
              {governanceSheets.map((s) => (
                <Link
                  key={s.slug}
                  href={`/sheets/${s.slug}`}
                  onClick={closeSidebar}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                    isActive(s.slug)
                      ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                      : "text-[#252A27] hover:bg-[#F6F7F5]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Users className="w-4 h-4 text-[#747C76] shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </div>
                  {s.badge && (
                    <span className="text-[10px] bg-[#EAF1EC] text-[#245C45] px-1.5 py-0.5 rounded font-medium shrink-0 ml-1">
                      {s.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Section 6: Historical & Archived Records */}
          <div>
            <button
              onClick={() => setArchiveOpen(!archiveOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] text-[#747C76] hover:bg-[#F6F7F5] font-medium"
            >
              <div className="flex items-center gap-2.5">
                <Archive className="w-4 h-4 text-[#747C76]" />
                <span>ऐतिहासिक अभिलेख ({archivedSheets.length})</span>
              </div>
              {archiveOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#747C76]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#747C76]" />
              )}
            </button>

            {archiveOpen && (
              <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-[#E1E5E1] ml-4 mt-1">
                {archivedSheets.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/sheets/${s.slug}`}
                    onClick={closeSidebar}
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

          {/* Section 7: Management & Sync */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#747C76]">
              व्यवस्थापन
            </div>
            <div className="space-y-0.5 mt-1">
              <Link
                href="/sync"
                onClick={closeSidebar}
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
                onClick={closeSidebar}
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
    </>
  );
}
