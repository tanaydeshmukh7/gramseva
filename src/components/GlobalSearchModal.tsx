"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  FileSpreadsheet,
  FileText,
  Printer,
  Users,
  RefreshCw,
  Settings,
  X,
  ArrowRight,
  BookOpen,
  Archive,
  Building2,
  Receipt,
  CornerDownLeft,
} from "lucide-react";
import { useUI } from "@/context/UIContext";
import { normalizeSearchString } from "@/lib/searchUtils";

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: "दस्तावेज" | "नोंदवह्या" | "मुद्रण" | "खाते" | "प्रशासन" | "अभिलेख";
  iconType: "spreadsheet" | "document" | "printer" | "users" | "sync" | "settings" | "book" | "archive";
  keywords: string;
}

const ALL_SEARCH_ITEMS: SearchItem[] = [
  // Statutory Documents
  {
    id: "utara",
    title: "नमुना ८ मिळकत उतारा",
    subtitle: "नियम ३२(१) नुसार अधिकृत संगणकीकृत उतारा (A4 PDF)",
    href: "/sheets/utara",
    category: "दस्तावेज",
    iconType: "document",
    keywords: "utara namuna 8 8a extract property milkat patrak",
  },
  {
    id: "magani-bill",
    title: "वार्षिक कर मागणी बिल",
    subtitle: "नमुना ९ वर आधारित अधिकृत कर मागणी बिल (A4 PDF)",
    href: "/sheets/magani-bill",
    category: "दस्तावेज",
    iconType: "document",
    keywords: "magani bill tax demand notice gharkar divakar panipatti",
  },
  {
    id: "namuna-10-pavati",
    title: "नमुना १० कर पावती",
    subtitle: "नियम २२(१२) अधिकृत दुहेरी वसुली पावती (A4 मुद्रण)",
    href: "/sheets/namuna-10-pavati",
    category: "दस्तावेज",
    iconType: "document",
    keywords: "namuna 10 pavati receipt tax payment cash online pavti",
  },
  {
    id: "namuna-7-pavati",
    title: "नमुना ७ पावती",
    subtitle: "संकीर्ण फी, दाखले व विविध जमा पावती (A4 मुद्रण)",
    href: "/sheets/namuna-7-pavati",
    category: "दस्तावेज",
    iconType: "document",
    keywords: "namuna 7 pavati fee certificate miscellaneous receipt",
  },
  {
    id: "masik-sabha-notice",
    title: "मासिक सभा नोटीस व WhatsApp",
    subtitle: "सभा नोटीस, अजेंडा व ९ सदस्यांसाठी WhatsApp प्रेषण",
    href: "/sheets/masik-sabha-notice",
    category: "प्रशासन",
    iconType: "users",
    keywords: "masik sabha notice monthly meeting agenda whatsapp members",
  },

  // Tax Assessment & Registers
  {
    id: "namuna-8",
    title: "नमुना ८ (कर आकारणी नोंदवही)",
    subtitle: "८०३+ नोंदणीकृत मिळकती, आकारणी व क्षेत्रफळ माहिती",
    href: "/sheets/namuna-8",
    category: "नोंदवह्या",
    iconType: "spreadsheet",
    keywords: "namuna 8 assessment register kar aakarni property records",
  },
  {
    id: "namuna-8-khatedar",
    title: "नमुना 8 खातेदार",
    subtitle: "६८२+ खातेदारांची वर्णानुक्रमे एकत्रित यादी",
    href: "/sheets/namuna-8-khatedar",
    category: "नोंदवह्या",
    iconType: "spreadsheet",
    keywords: "namuna 8 khatedar account holders alphabetized list",
  },
  {
    id: "namuna-9",
    title: "नमुना ९ (कर मागणी नोंदवही)",
    subtitle: "७०७+ करदात्यांची वार्षिक कर मागणी, थकीत व चालू येणे",
    href: "/sheets/namuna-9",
    category: "नोंदवह्या",
    iconType: "spreadsheet",
    keywords: "namuna 9 demand register tax dues arrears current demand",
  },
  {
    id: "namuna-9-goshavara",
    title: "नमुना ९ गोषवारा",
    subtitle: "पाननिहाय कर मागणी व वसुली गोषवारा पत्रक",
    href: "/sheets/namuna-9-goshavara",
    category: "नोंदवह्या",
    iconType: "spreadsheet",
    keywords: "namuna 9 goshavara summary abstract page wise total",
  },
  {
    id: "thakbaki-yadi-2026-27",
    title: "थकबाकी यादी २०२६-२७",
    subtitle: "चालू व मागील वर्षाची प्रलंबित कर थकबाकी यादी",
    href: "/sheets/thakbaki-yadi-2026-27",
    category: "नोंदवह्या",
    iconType: "spreadsheet",
    keywords: "thakbaki yadi arrears pending dues defaulters list 2026-27",
  },
  {
    id: "namuna-8-rates",
    title: "न.८ साठीचे अधिकृत कर दर",
    subtitle: "इमारत कर, दिवाबत्ती, पाणीपट्टी व आरोग्य कर दर तक्ता",
    href: "/sheets/namuna-8-rates",
    category: "नोंदवह्या",
    iconType: "spreadsheet",
    keywords: "namuna 8 rates tax slab rules valuation rates dar takta",
  },
  {
    id: "all-mobile-no",
    title: "all mobile no (करदाते संपर्क)",
    subtitle: "६८० नागरिक व पडताळलेले भ्रमणध्वनी क्रमांक",
    href: "/sheets/all-mobile-no",
    category: "नोंदवह्या",
    iconType: "spreadsheet",
    keywords: "all mobile no contact phone phonebook nagarik sampark",
  },

  // Printable A4 Registers
  {
    id: "namuna-8-print-register",
    title: "नमुना ८ प्रिंट रजिस्टर",
    subtitle: "शासकीय तपासणीसाठी पूर्ण नमुना ८ रजिस्टर (A4 प्रिंट)",
    href: "/sheets/namuna-8-print-register",
    category: "मुद्रण",
    iconType: "printer",
    keywords: "namuna 8 print register official print copy a4 landscape",
  },
  {
    id: "namuna-9-print-register",
    title: "नमुना ९ प्रिंट रजिस्टर",
    subtitle: "शासकीय तपासणीसाठी पूर्ण नमुना ९ रजिस्टर (A4 प्रिंट)",
    href: "/sheets/namuna-9-print-register",
    category: "मुद्रण",
    iconType: "printer",
    keywords: "namuna 9 print register official demand print copy a4",
  },

  // Cashbooks & Accounts
  {
    id: "namuna-na-6",
    title: "नमुना न. ६ (जमा नोंदवही)",
    subtitle: "दैनंदिन कर व गैर-कर महसूल जमा नोंदवही",
    href: "/sheets/namuna-na-6",
    category: "खाते",
    iconType: "book",
    keywords: "namuna 6 jama nondvahi daily collection cashbook accounts",
  },
  {
    id: "namuna-5-samanya",
    title: "नमुना ५ सामान्य निधी कॅशबुक",
    subtitle: "ग्रामपंचायत सामान्य फंड जमा व खर्च नोंदवही",
    href: "/sheets/namuna-5-samanya",
    category: "खाते",
    iconType: "book",
    keywords: "namuna 5 samanya general fund cashbook jama kharch",
  },
  {
    id: "namuna-5-16-vitta",
    title: "नमुना ५ १६ वित्त आयोग",
    subtitle: "१६ वा वित्त आयोग विशेष विकास निधी नोंदवही",
    href: "/sheets/namuna-5-16-vitta",
    category: "खाते",
    iconType: "book",
    keywords: "namuna 5 16 vitta finance commission grants 16th cashbook",
  },
  {
    id: "namuna-5-pani-purwatha",
    title: "न.नं.५ पाणी पुरवठा योजना",
    subtitle: "नळ पाणी पुरवठा विशेष निधी जमा-खर्च नोंदवही",
    href: "/sheets/namuna-5-pani-purwatha",
    category: "खाते",
    iconType: "book",
    keywords: "namuna 5 pani purwatha water supply maintenance fund",
  },
  {
    id: "sheet1",
    title: "Sheet1 (लेखाशीर्ष यादी)",
    subtitle: "अर्थसंकल्पीय व शासकीय जमा-खर्च मुख्य शीर्षके",
    href: "/sheets/sheet1",
    category: "खाते",
    iconType: "book",
    keywords: "sheet1 budget heads lekha shirsha account codes",
  },

  // Management & Sync
  {
    id: "sync",
    title: "गुगल शीट्स सिंक्रोनायझेशन",
    subtitle: "द्विमार्गी सिंक, वेबहूक व्यवस्थापन व रीअल-टाइम डेटा पडताळणी",
    href: "/sync",
    category: "प्रशासन",
    iconType: "sync",
    keywords: "google sheets sync webhook two way live update backup",
  },
  {
    id: "settings",
    title: "प्रशासक सेटिंग्ज",
    subtitle: "ग्रामपंचायत माहिती, आर्थिक वर्ष व प्रणाली संरचना",
    href: "/settings",
    category: "प्रशासन",
    iconType: "settings",
    keywords: "settings prashasak administration config profile backup",
  },
];

export default function GlobalSearchModal() {
  const { globalSearchOpen, setGlobalSearchOpen } = useUI();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (globalSearchOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [globalSearchOpen]);

  const filteredItems = React.useMemo(() => {
    const q = normalizeSearchString(query);
    if (!q) return ALL_SEARCH_ITEMS.slice(0, 8);

    return ALL_SEARCH_ITEMS.filter((item) => {
      const titleNorm = normalizeSearchString(item.title);
      const subNorm = normalizeSearchString(item.subtitle);
      const keyNorm = normalizeSearchString(item.keywords);
      const catNorm = normalizeSearchString(item.category);

      return (
        titleNorm.includes(q) ||
        subNorm.includes(q) ||
        keyNorm.includes(q) ||
        catNorm.includes(q)
      );
    });
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        router.push(filteredItems[selectedIndex].href);
        setGlobalSearchOpen(false);
      }
    }
  };

  if (!globalSearchOpen) return null;

  const renderIcon = (type: SearchItem["iconType"]) => {
    switch (type) {
      case "document":
        return <FileText className="w-4 h-4 text-[#245C45]" />;
      case "printer":
        return <Printer className="w-4 h-4 text-[#245C45]" />;
      case "users":
        return <Users className="w-4 h-4 text-[#245C45]" />;
      case "sync":
        return <RefreshCw className="w-4 h-4 text-[#245C45]" />;
      case "settings":
        return <Settings className="w-4 h-4 text-[#245C45]" />;
      case "book":
        return <BookOpen className="w-4 h-4 text-[#245C45]" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 text-[#245C45]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 p-4 animate-in fade-in duration-150"
      onClick={() => setGlobalSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E6EAE5] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#E6EAE5] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#68736C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="शीटचे नाव, नमुना, पावती, उतारा किंवा सेवा शोधा... (उदा. नमुना ८, पावती, 7A)"
            className="w-full text-sm font-medium text-[#202923] placeholder-[#9DA39F] bg-transparent focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-[#68736C] hover:bg-[#F7F8F5] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#F7F8F5] text-[#68736C] border border-[#E6EAE5] rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#68736C]">
              <p className="font-medium text-[#202923]">कोणतीही जुळणारी नोंद सापडली नाही</p>
              <p className="text-xs text-[#9DA39F] mt-1">
                कृपया वेगळे नाव किंवा क्रमांक टाकून पुन्हा प्रयत्न करा
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setGlobalSearchOpen(false)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                    isSelected
                      ? "bg-[#EAF1EC] text-[#245C45] border-l-4 border-[#245C45]"
                      : "hover:bg-[#F7F8F5] text-[#202923]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-white shadow-xs" : "bg-[#F7F8F5]"
                      }`}
                    >
                      {renderIcon(item.iconType)}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 text-[#68736C] border border-[#E6EAE5] font-medium shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#68736C] truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isSelected && (
                      <span className="text-[11px] font-medium text-[#245C45] flex items-center gap-1">
                        <span>उघडा</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-[#F7F8F5] border-t border-[#E6EAE5] flex items-center justify-between text-[11px] text-[#68736C]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-[#E6EAE5] rounded text-[10px] font-mono">
                ↑
              </kbd>
              <kbd className="px-1 py-0.5 bg-white border border-[#E6EAE5] rounded text-[10px] font-mono">
                ↓
              </kbd>
              <span>नेव्हिगेट करा</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#E6EAE5] rounded text-[10px] font-mono">
                ↵
              </kbd>
              <span>उघडा</span>
            </span>
          </div>
          <span>एकूण {ALL_SEARCH_ITEMS.length} शीट्स व सेवा</span>
        </div>
      </div>
    </div>
  );
}
