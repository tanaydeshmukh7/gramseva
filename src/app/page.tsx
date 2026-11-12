import React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  FileText,
  Users,
  Receipt,
  ExternalLink,
  RefreshCw,
  Building2,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Printer,
  ShieldCheck,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { getSheetsMeta, getSheetBySlug } from "@/lib/sheetsService";

// Helper to convert number to Devanagari numerals
function toDevanagari(num: number | string): string {
  const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(num).replace(/\d/g, (d) => devanagariDigits[parseInt(d, 10)]);
}

function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString("en-IN");
  return `₹${toDevanagari(formatted)}`;
}

export default function DashboardPage() {
  const meta = getSheetsMeta();
  const n8 = getSheetBySlug("namuna-8");
  const n9 = getSheetBySlug("namuna-9");
  const mob = getSheetBySlug("all-mobile-no");
  const thak = getSheetBySlug("thakbaki-yadi-2026-27");

  // Dynamic Live Calculations
  let propertyCount = 0;
  if (n8) {
    for (const r of n8.rows) {
      if (
        r.row_index >= 7 &&
        (r.cells.find((c) => c.col === 2)?.value || r.cells.find((c) => c.col === 3)?.value)
      ) {
        propertyCount++;
      }
    }
  }

  let taxpayerCount = 0;
  let totalDemandSum = 0;
  if (n9) {
    for (const r of n9.rows) {
      if (
        r.row_index >= 7 &&
        (r.cells.find((c) => c.col === 2)?.value || r.cells.find((c) => c.col === 3)?.value)
      ) {
        taxpayerCount++;
        const totalCol = r.cells.find((c) => c.col === 17)?.value;
        if (totalCol && !isNaN(parseFloat(String(totalCol)))) {
          totalDemandSum += parseFloat(String(totalCol));
        }
      }
    }
  }

  let citizenCount = 0;
  let verifiedPhoneCount = 0;
  if (mob) {
    for (const r of mob.rows) {
      if (r.row_index >= 2) {
        const name =
          r.cells.find((c) => c.col === 2)?.value || r.cells.find((c) => c.col === 1)?.value;
        const phone = r.cells.find((c) => c.col === 7)?.value;
        if (name) citizenCount++;
        if (phone && String(phone).replace(/\D/g, "").length >= 10) verifiedPhoneCount++;
      }
    }
  }

  let defaulterCount = 0;
  if (thak) {
    for (const r of thak.rows) {
      if (
        r.row_index >= 5 &&
        (r.cells.find((c) => c.col === 2)?.value || r.cells.find((c) => c.col === 3)?.value)
      ) {
        defaulterCount++;
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Administrative Hero Header */}
      <div className="bg-white border border-[#E6EAE5] rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#245C45] uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
            <span>संगणकीकृत ग्रामपंचायत प्रणाली • अधिकृत व्यवस्थापन पोर्टल</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202923] tracking-tight">
            ग्रामपंचायत गोहगाव — मुख्य नियंत्रण कक्ष
          </h2>
          <p className="text-xs sm:text-sm text-[#68736C] mt-1">
            तालुका: रिसोड • जिल्हा: वाशिम • आर्थिक वर्ष: <strong>२०२६ - २०२७</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link
            href="/sync"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#EAF1EC] text-[#245C45] hover:bg-[#dbe7de] transition-colors text-xs font-semibold border border-[#245C45]/20 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>गुगल शीट्स सिंक स्थिती</span>
          </Link>
          <a
            href="https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#245C45] text-white hover:bg-[#1D4B38] transition-colors text-xs font-semibold shadow-xs"
          >
            <span>मूळ Google Sheets उघडा</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Real Live Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Registered Properties (N8) */}
        <Link
          href="/sheets/namuna-8"
          className="bg-white border border-[#E6EAE5] rounded-xl p-4 sm:p-5 hover:border-[#245C45] hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#68736C] uppercase tracking-wider">
                नोंदणीकृत मिळकती
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EAF1EC] text-[#245C45] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#202923]">
                {toDevanagari(propertyCount)}
              </span>
              <span className="text-xs text-[#68736C]">मिळकती</span>
            </div>
            <p className="text-xs text-[#68736C] mt-1">
              नमुना ८ आकारणी नोंदवहीत एकूण {toDevanagari(n8?.rows.length || 0)} नोंदी
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E6EAE5] flex items-center justify-between text-xs text-[#245C45] font-semibold">
            <span>कर आकारणी पहा</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Metric 2: Tax Demand & Revenue (N9) */}
        <Link
          href="/sheets/namuna-9"
          className="bg-white border border-[#E6EAE5] rounded-xl p-4 sm:p-5 hover:border-[#245C45] hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#68736C] uppercase tracking-wider">
                एकूण वार्षिक कर मागणी
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EAF1EC] text-[#245C45] flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#245C45]">
                {formatCurrency(totalDemandSum)}
              </span>
            </div>
            <p className="text-xs text-[#68736C] mt-1">
              नमुना ९ नुसार एकूण {toDevanagari(taxpayerCount)} करदात्यांची मागणी
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E6EAE5] flex items-center justify-between text-xs text-[#245C45] font-semibold">
            <span>कर मागणी रजिस्टर</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Metric 3: Arrears Defaulters */}
        <Link
          href="/sheets/thakbaki-yadi-2026-27"
          className="bg-white border border-[#E6EAE5] rounded-xl p-4 sm:p-5 hover:border-[#E65100] hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#68736C] uppercase tracking-wider">
                प्रलंबित थकबाकी खाती
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] text-[#E65100] flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#E65100]">
                {toDevanagari(defaulterCount)}
              </span>
              <span className="text-xs text-[#68736C]">थकबाकीदार</span>
            </div>
            <p className="text-xs text-[#68736C] mt-1">
              थकबाकी यादी २०२६-२७ मधील सक्रिय नोंदी
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E6EAE5] flex items-center justify-between text-xs text-[#E65100] font-semibold">
            <span>थकबाकी यादी पहा</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Metric 4: Citizen Directory & Phones */}
        <Link
          href="/sheets/all-mobile-no"
          className="bg-white border border-[#E6EAE5] rounded-xl p-4 sm:p-5 hover:border-[#245C45] hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#68736C] uppercase tracking-wider">
                नागरिक संपर्क नोंद
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EAF1EC] text-[#245C45] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#202923]">
                {toDevanagari(citizenCount)}
              </span>
              <span className="text-xs text-[#68736C]">नागरिक</span>
            </div>
            <p className="text-xs text-[#68736C] mt-1">
              {toDevanagari(verifiedPhoneCount)} पडताळलेले मोबाइल क्रमांक उपलब्ध
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E6EAE5] flex items-center justify-between text-xs text-[#245C45] font-semibold">
            <span>संपर्क यादी पहा</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Quick Administrative Action Center (A4 Statutory Print & Generation) */}
      <div className="bg-white border border-[#E6EAE5] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#202923]">
              कायदेशीर दस्तावेज व पावती केंद्र (A4 Statutory Printing)
            </h3>
            <p className="text-xs text-[#68736C] mt-0.5">
              शासकीय नियमांनुसार थेट A4 साइजवर प्रिंट व PDF तयार करण्यासाठी त्वरित शॉर्टकट
            </p>
          </div>
          <span className="text-[11px] bg-[#EAF1EC] text-[#245C45] font-semibold px-2.5 py-1 rounded-full border border-[#245C45]/15 self-start sm:self-auto">
            A4 मुद्रण अनुकूलित
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Action 1: Namuna 10 Pavati */}
          <Link
            href="/sheets/namuna-10-pavati"
            className="p-4 rounded-xl border border-[#E6EAE5] hover:border-[#245C45] hover:bg-[#F7F8F5] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1EC] text-[#245C45] flex items-center justify-center mb-3 font-bold text-sm">
                १०
              </div>
              <h4 className="text-sm font-bold text-[#202923] group-hover:text-[#245C45] transition-colors">
                नमुना १० कर पावती
              </h4>
              <p className="text-xs text-[#68736C] mt-1 line-clamp-2">
                नियम २२(१२) नुसार घरकर, पाणीपट्टी अधिकृत दुहेरी पावती (A4 मुद्रण)
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#E6EAE5] flex items-center justify-between text-xs font-semibold text-[#245C45]">
              <span>पावती फाडा</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 2: Utara */}
          <Link
            href="/sheets/utara"
            className="p-4 rounded-xl border border-[#E6EAE5] hover:border-[#245C45] hover:bg-[#F7F8F5] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1EC] text-[#245C45] flex items-center justify-center mb-3 font-bold text-sm">
                ८
              </div>
              <h4 className="text-sm font-bold text-[#202923] group-hover:text-[#245C45] transition-colors">
                नमुना ८ मिळकत उतारा
              </h4>
              <p className="text-xs text-[#68736C] mt-1 line-clamp-2">
                नियम ३२(१) नुसार मिळकतीचा अधिकृत संगणकीकृत उतारा (A4 PDF)
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#E6EAE5] flex items-center justify-between text-xs font-semibold text-[#245C45]">
              <span>उतारा काढा</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 3: Magani Bill */}
          <Link
            href="/sheets/magani-bill"
            className="p-4 rounded-xl border border-[#E6EAE5] hover:border-[#245C45] hover:bg-[#F7F8F5] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1EC] text-[#245C45] flex items-center justify-center mb-3 font-bold text-sm">
                ब
              </div>
              <h4 className="text-sm font-bold text-[#202923] group-hover:text-[#245C45] transition-colors">
                वार्षिक कर मागणी बिल
              </h4>
              <p className="text-xs text-[#68736C] mt-1 line-clamp-2">
                नमुना ९ वर आधारित थकीत व चालू मागणी बिल (A4 PDF)
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#E6EAE5] flex items-center justify-between text-xs font-semibold text-[#245C45]">
              <span>बिल जनरेट करा</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 4: Masik Sabha Notice */}
          <Link
            href="/sheets/masik-sabha-notice"
            className="p-4 rounded-xl border border-[#E6EAE5] hover:border-[#245C45] hover:bg-[#F7F8F5] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1EC] text-[#245C45] flex items-center justify-center mb-3 font-bold text-sm">
                स
              </div>
              <h4 className="text-sm font-bold text-[#202923] group-hover:text-[#245C45] transition-colors">
                मासिक सभा व WhatsApp
              </h4>
              <p className="text-xs text-[#68736C] mt-1 line-clamp-2">
                ७ अजेंडा विषय व ९ सदस्यांसाठी WhatsApp व छापील नोटीस
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#E6EAE5] flex items-center justify-between text-xs font-semibold text-[#245C45]">
              <span>नोटीस पाठवा</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Complete Worksheets Directory (All 34 Worksheets) */}
      <div className="bg-white border border-[#E6EAE5] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-[#E6EAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#202923]">
                सर्व ३४ मूळ वर्कशीट्स सूची (Worksheets Directory)
              </h3>
            </div>
            <p className="text-xs text-[#68736C] mt-0.5">
              नवीन १९ सक्रिय वर्कशीट्स आणि १५ ऐतिहासिक कॅशबुक व वसुली अभिलेख
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#EAF1EC] text-[#245C45] font-semibold px-2.5 py-1 rounded-md border border-[#245C45]/15">
              १९ सक्रिय
            </span>
            <span className="text-xs bg-[#F7F8F5] text-[#68736C] font-semibold px-2.5 py-1 rounded-md border border-[#E6EAE5]">
              १५ ऐतिहासिक
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8F5] border-b border-[#E6EAE5] text-[#68736C] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">क्र.</th>
                <th className="py-3 px-4">वर्कशीटचे मूळ नाव</th>
                <th className="py-3 px-4">प्रवर्ग (Category)</th>
                <th className="py-3 px-4 text-right">नोंदी (Rows)</th>
                <th className="py-3 px-4 text-right">कॉलम्स (Cols)</th>
                <th className="py-3 px-4 text-center">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAE5]">
              {meta.sheets.map((s, idx) => (
                <tr key={s.slug} className="hover:bg-[#F7F8F5] transition-colors">
                  <td className="py-3 px-4 font-mono text-[#68736C] text-center">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#202923]">
                    <Link
                      href={`/sheets/${s.slug}`}
                      className="inline-flex items-center gap-2 hover:text-[#245C45] transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#245C45] shrink-0" />
                      <span className="font-semibold">{s.name}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7F8F5] text-[#68736C] border border-[#E6EAE5]">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-[#202923]">
                    {s.populated_rows_count.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#68736C]">
                    {s.max_col}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/sheets/${s.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#245C45] hover:bg-[#EAF1EC] px-2.5 py-1 rounded transition-colors"
                    >
                      <span>उघडा</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
