"use client";

import React, { useState, useMemo } from "react";
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
  Landmark,
  ShieldCheck,
  BookOpen,
  Printer,
  Archive,
  Search,
  X,
  CreditCard,
  FileCheck,
} from "lucide-react";
import { useUI } from "@/context/UIContext";
import { normalizeSearchString } from "@/lib/searchUtils";

interface SheetNav {
  slug: string;
  name: string;
  sub?: string;
  badge?: string;
}

// 1. कर आकारणी व खातेदार नोंदवह्या (Tax & Khatedar Assessment)
const taxAndAssessmentSheets: SheetNav[] = [
  { slug: "namuna-8", name: "नमुना ८ (कर आकारणी)", sub: "८०३ मिळकती", badge: "१२५० नोंदी" },
  { slug: "namuna-8-khatedar", name: "नमुना 8 खातेदार", sub: "खातेदार यादी", badge: "६८२ खातेदार" },
  { slug: "namuna-9", name: "नमुना ९ (कर मागणी)", sub: "वार्षिक मागणी", badge: "१००० मागण्या" },
  { slug: "namuna-9-goshavara", name: "नमुना ९ गोषवारा", sub: "गोषवारा पत्रक", badge: "पाननिहाय" },
  { slug: "thakbaki-yadi-2026-27", name: "थकबाकी यादी २०२६-२७", sub: "थकीत कर यादी", badge: "७१२ बाकी" },
  { slug: "namuna-8-rates", name: "न.८ साठीचे दर", sub: "कर नियम दर", badge: "५२८ दर" },
  { slug: "all-mobile-no", name: "all mobile no", sub: "संपर्क यादी", badge: "७५७ संपर्क" },
];

// 2. कायदेशीर दस्तावेज व पावत्या (Statutory Documents & Receipts)
const documentSheets: SheetNav[] = [
  { slug: "utara", name: "नमुना ८ उतारा", sub: "नियम ३२(१) A4 PDF", badge: "A4 PDF" },
  { slug: "magani-bill", name: "वार्षिक मागणी बिल", sub: "कर मागणी पत्रक", badge: "A4 PDF" },
  { slug: "namuna-10-pavati", name: "नमुना १० कर पावती", sub: "नियम २२(१२) वसुली", badge: "दुहेरी प्रिंट" },
  { slug: "namuna-7-pavati", name: "नमुना ७ पावती", sub: "दाखले व विविध फी", badge: "A4 प्रिंट" },
];

// 3. अधिकृत मुद्रण रजिस्टर्स (Printable A4 Registers)
const printRegisters: SheetNav[] = [
  { slug: "namuna-8-print-register", name: "नमुना ८ प्रिंट रजिस्टर", sub: "तपासणी नोंदवही", badge: "A4 मुद्रण" },
  { slug: "namuna-9-print-register", name: "नमुना ९ प्रिंट रजिस्टर", sub: "मागणी नोंदवही", badge: "A4 मुद्रण" },
];

// 4. कॅशबुक व जमा नोंदवही (Cashbooks & Accounts)
const cashbookSheets: SheetNav[] = [
  { slug: "namuna-na-6", name: "नमुना न. ६ (जमा नोंदवही)", sub: "दैनंदिन जमा", badge: "७८ नोंदी" },
  { slug: "namuna-5-samanya", name: "नमुना ५ सामान्य निधी", sub: "सामान्य कॅशबुक", badge: "२९ नोंदी" },
  { slug: "namuna-5-16-vitta", name: "नमुना ५ १६ वित्त आयोग", sub: "१६ वा वित्त निधी", badge: "२२ नोंदी" },
  { slug: "namuna-5-pani-purwatha", name: "न.नं.५ पाणी पुरवठा", sub: "पाणी योजना फंड", badge: "२९ नोंदी" },
  { slug: "sheet1", name: "Sheet1 (लेखाशीर्ष)", sub: "जमा-खर्च शीर्षके", badge: "लेखाशीर्ष" },
];

// 5. प्रशासन व मासिक सभा (Governance & Notice)
const governanceSheets: SheetNav[] = [
  { slug: "masik-sabha-notice", name: "मासिक सभा नोटीस", sub: "अजेंडा व WhatsApp", badge: "१३ सदस्य" },
];

// 6. ऐतिहासिक अभिलेख (Archived / Historical Records - 15 sheets)
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

const ALL_SHEETS = [
  ...taxAndAssessmentSheets.map((s) => ({ ...s, group: "मालमत्ता व कर आकारणी" })),
  ...documentSheets.map((s) => ({ ...s, group: "दस्तावेज व पावत्या" })),
  ...printRegisters.map((s) => ({ ...s, group: "मुद्रण रजिस्टर्स" })),
  ...cashbookSheets.map((s) => ({ ...s, group: "कॅशबुक व खाती" })),
  ...governanceSheets.map((s) => ({ ...s, group: "प्रशासन व सभा" })),
  ...archivedSheets.map((s) => ({ ...s, group: "ऐतिहासिक अभिलेख" })),
];

export default function Sidebar() {
  const pathname = usePathname();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const { sidebarOpen, closeSidebar } = useUI();

  const isActive = (slug: string) => {
    return pathname === `/sheets/${slug}`;
  };

  const filteredSheets = useMemo(() => {
    const q = normalizeSearchString(filterQuery);
    if (!q) return null;
    return ALL_SHEETS.filter(
      (s) =>
        normalizeSearchString(s.name).includes(q) ||
        normalizeSearchString(s.slug).includes(q) ||
        (s.sub && normalizeSearchString(s.sub).includes(q))
    );
  }, [filterQuery]);

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 w-72 bg-white border-r border-[#E6EAE5] flex flex-col h-screen select-none shrink-0 overflow-hidden no-print transition-transform duration-200 ease-in-out shadow-xs ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-3.5 border-b border-[#E6EAE5] bg-white flex items-center justify-between">
          <Link href="/" onClick={closeSidebar} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#245C45] flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-[#1D4B38] transition-colors">
              ग
            </div>
            <div>
              <div className="font-bold text-sm text-[#202923] tracking-tight flex items-center gap-1.5">
                <span>Gramसेवा</span>
                <span className="text-[10px] bg-[#EAF1EC] text-[#245C45] font-semibold px-1.5 py-0.2 rounded border border-[#245C45]/15">
                  गोहगाव
                </span>
              </div>
              <p className="text-[11px] text-[#68736C] font-medium leading-tight">
                ग्रा.पं. व्यवस्थापन प्रणाली
              </p>
            </div>
          </Link>

          <button
            onClick={closeSidebar}
            className="md:hidden p-1.5 rounded-md text-[#68736C] hover:bg-[#F7F8F5] hover:text-[#202923] transition-colors"
            aria-label="मेनू बंद करा"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Box */}
        <div className="px-3 pt-3 pb-2 border-b border-[#E6EAE5] bg-[#F7F8F5]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#68736C] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="शीट किंवा नमुना शोधा..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#E6EAE5] rounded-md text-[#202923] placeholder-[#9DA39F] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20 transition-all"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#9DA39F] hover:text-[#202923]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Nav List Container */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 text-sm">
          {/* Filtered Search Results View */}
          {filteredSheets !== null ? (
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#68736C] flex items-center justify-between">
                <span>शोध निकाल</span>
                <span className="font-mono text-[#245C45]">{filteredSheets.length} उपलब्ध</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredSheets.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-[#9DA39F]">
                    कोणतीही जुळणारी शीट सापडली नाही
                  </p>
                ) : (
                  filteredSheets.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/sheets/${s.slug}`}
                      onClick={closeSidebar}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isActive(s.slug)
                          ? "bg-[#EAF1EC] text-[#245C45] font-semibold border-l-3 border-[#245C45]"
                          : "text-[#202923] hover:bg-[#F7F8F5]"
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate font-medium">{s.name}</div>
                        <div className="text-[10px] text-[#68736C] truncate">{s.group}</div>
                      </div>
                      {s.badge && (
                        <span className="text-[10px] bg-[#F7F8F5] text-[#68736C] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1 border border-[#E6EAE5]">
                          {s.badge}
                        </span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Dashboard Link */}
              <div>
                <Link
                  href="/"
                  onClick={closeSidebar}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/"
                      ? "bg-[#EAF1EC] text-[#245C45] font-semibold border-l-3 border-[#245C45]"
                      : "text-[#202923] hover:bg-[#F7F8F5]"
                  }`}
                >
                  <Landmark className="w-4 h-4 text-[#245C45]" />
                  <span>मुख्य डॅशबोर्ड</span>
                </Link>
              </div>

              {/* Section 1: Property & Assessment */}
              <div>
                <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#68736C] flex items-center justify-between">
                  <span>मालमत्ता व कर आकारणी</span>
                  <span className="text-[10px] text-[#9DA39F] font-mono">७ शीट्स</span>
                </div>
                <div className="space-y-0.5 mt-1">
                  {taxAndAssessmentSheets.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/sheets/${s.slug}`}
                      onClick={closeSidebar}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isActive(s.slug)
                          ? "bg-[#EAF1EC] text-[#245C45] font-semibold border-l-3 border-[#245C45]"
                          : "text-[#202923] hover:bg-[#F7F8F5]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="w-3.5 h-3.5 text-[#68736C] shrink-0" />
                        <span className="truncate">{s.name}</span>
                      </div>
                      {s.badge && (
                        <span className="text-[10px] bg-[#F7F8F5] text-[#68736C] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1 border border-[#E6EAE5]">
                          {s.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Section 2: Statutory Documents & Printing */}
              <div>
                <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#68736C] flex items-center justify-between">
                  <span>दस्तावेज व पावत्या (A4)</span>
                  <span className="text-[10px] text-[#9DA39F] font-mono">४ नमुने</span>
                </div>
                <div className="space-y-0.5 mt-1">
                  {documentSheets.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/sheets/${s.slug}`}
                      onClick={closeSidebar}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isActive(s.slug)
                          ? "bg-[#EAF1EC] text-[#245C45] font-semibold border-l-3 border-[#245C45]"
                          : "text-[#202923] hover:bg-[#F7F8F5]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-[#245C45] shrink-0" />
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

              {/* Section 3: Official Printable Registers */}
              <div>
                <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#68736C] flex items-center justify-between">
                  <span>मुद्रण रजिस्टर्स (A4)</span>
                  <span className="text-[10px] text-[#9DA39F] font-mono">२ रजिस्टर्स</span>
                </div>
                <div className="space-y-0.5 mt-1">
                  {printRegisters.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/sheets/${s.slug}`}
                      onClick={closeSidebar}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isActive(s.slug)
                          ? "bg-[#EAF1EC] text-[#245C45] font-semibold border-l-3 border-[#245C45]"
                          : "text-[#202923] hover:bg-[#F7F8F5]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Printer className="w-3.5 h-3.5 text-[#245C45] shrink-0" />
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

              {/* Section 4: Cashbooks & Accounts */}
              <div>
                <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#68736C] flex items-center justify-between">
                  <span>कॅशबुक व खाती</span>
                  <span className="text-[10px] text-[#9DA39F] font-mono">५ शीट्स</span>
                </div>
                <div className="space-y-0.5 mt-1">
                  {cashbookSheets.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/sheets/${s.slug}`}
                      onClick={closeSidebar}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isActive(s.slug)
                          ? "bg-[#EAF1EC] text-[#245C45] font-semibold border-l-3 border-[#245C45]"
                          : "text-[#202923] hover:bg-[#F7F8F5]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <BookOpen className="w-3.5 h-3.5 text-[#68736C] shrink-0" />
                        <span className="truncate">{s.name}</span>
                      </div>
                      {s.badge && (
                        <span className="text-[10px] bg-[#F7F8F5] text-[#68736C] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1 border border-[#E6EAE5]">
                          {s.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Section 5: Governance & Meeting Notice */}
              <div>
                <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#68736C]">
                  प्रशासन व मासिक सभा
                </div>
                <div className="space-y-0.5 mt-1">
                  {governanceSheets.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/sheets/${s.slug}`}
                      onClick={closeSidebar}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isActive(s.slug)
                          ? "bg-[#EAF1EC] text-[#245C45] font-semibold border-l-3 border-[#245C45]"
                          : "text-[#202923] hover:bg-[#F7F8F5]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Users className="w-3.5 h-3.5 text-[#68736C] shrink-0" />
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
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#68736C] hover:bg-[#F7F8F5] font-medium transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-3.5 h-3.5 text-[#68736C]" />
                    <span>ऐतिहासिक अभिलेख ({archivedSheets.length})</span>
                  </div>
                  {archiveOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#68736C]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#68736C]" />
                  )}
                </button>

                {archiveOpen && (
                  <div className="pl-5 pr-1 py-1 space-y-0.5 border-l-2 border-[#E6EAE5] ml-4 mt-1">
                    {archivedSheets.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/sheets/${s.slug}`}
                        onClick={closeSidebar}
                        className={`block px-2 py-1 rounded text-xs transition-colors ${
                          isActive(s.slug)
                            ? "bg-[#EAF1EC] text-[#245C45] font-semibold"
                            : "text-[#68736C] hover:text-[#202923] hover:bg-[#F7F8F5]"
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
                <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#68736C]">
                  प्रणाली व्यवस्थापन
                </div>
                <div className="space-y-0.5 mt-1">
                  <Link
                    href="/sync"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      pathname === "/sync"
                        ? "bg-[#EAF1EC] text-[#245C45] font-semibold border-l-3 border-[#245C45]"
                        : "text-[#202923] hover:bg-[#F7F8F5]"
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#245C45]" />
                    <span>गुगल शीट्स सिंक</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      pathname === "/settings"
                        ? "bg-[#EAF1EC] text-[#245C45] font-semibold border-l-3 border-[#245C45]"
                        : "text-[#202923] hover:bg-[#F7F8F5]"
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-[#68736C]" />
                    <span>प्रशासक सेटिंग्ज</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-[#E6EAE5] bg-[#F7F8F5] text-xs text-[#68736C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
            <span className="font-medium text-[#202923]">प्रशासक सक्रिय</span>
          </div>
          <span className="font-mono text-[11px] text-[#68736C]">सन २०२६-२७</span>
        </div>
      </aside>
    </>
  );
}
