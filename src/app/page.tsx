import React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  FileText,
  Users,
  Receipt,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight,
} from "lucide-react";
import { getSheetsMeta } from "@/lib/sheetsService";

export default function DashboardPage() {
  const meta = getSheetsMeta();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Administrative Header Banner */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#245C45] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
            <span>संगणकीकृत ग्रामपंचायत प्रणाली • अधिकृत पोर्टल</span>
          </div>
          <h2 className="text-xl font-bold text-[#252A27]">
            ग्रामपंचायत गोहगाव — व्यवस्थापन डॅशबोर्ड
          </h2>
          <p className="text-xs text-[#747C76] mt-0.5">
            तालुका: रिसोड • जिल्हा: वाशिम • आर्थिक वर्ष: २०२६ - २०२७
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sync"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#EAF1EC] text-[#245C45] hover:bg-[#d8e7dc] transition-colors text-xs font-medium border border-[#cbe0d3]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>गुगल शीट्स सिंक स्थिती</span>
          </Link>
          <a
            href="https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#245C45] text-white hover:bg-[#1b4534] transition-colors text-xs font-medium shadow-xs"
          >
            <span>मूळ Google Sheets उघडा</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Verified Data Metric Cards (From Excel Inspection) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Namuna 8 */}
        <Link
          href="/sheets/namuna-8"
          className="bg-white border border-[#E1E5E1] rounded-lg p-4 hover:border-[#245C45] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#747C76]">मालमत्ता नोंद (नमुना ८)</span>
            <Building2 className="w-4 h-4 text-[#245C45]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#252A27]">८०३</span>
            <span className="text-xs text-[#747C76]">नोंदणीकृत मिळकती</span>
          </div>
          <p className="text-[11px] text-[#747C76] mt-2 flex items-center justify-between border-t border-[#F0F2EF] pt-2">
            <span>कर आकारणी नोंदवही</span>
            <ArrowRight className="w-3 h-3 text-[#245C45] group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Card 2: Namuna 9 */}
        <Link
          href="/sheets/namuna-9"
          className="bg-white border border-[#E1E5E1] rounded-lg p-4 hover:border-[#245C45] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#747C76]">कर मागणी (नमुना ९)</span>
            <Receipt className="w-4 h-4 text-[#245C45]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#252A27]">७०७</span>
            <span className="text-xs text-[#747C76]">करदाते मागण्या</span>
          </div>
          <p className="text-[11px] text-[#747C76] mt-2 flex items-center justify-between border-t border-[#F0F2EF] pt-2">
            <span>घरकर, दिवाकर, पाणीपट्टी</span>
            <ArrowRight className="w-3 h-3 text-[#245C45] group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Card 3: Committee Members */}
        <Link
          href="/sheets/masik-sabha-notice"
          className="bg-white border border-[#E1E5E1] rounded-lg p-4 hover:border-[#245C45] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#747C76]">मासिक सभा समिती</span>
            <Users className="w-4 h-4 text-[#245C45]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#252A27]">९</span>
            <span className="text-xs text-[#747C76]">सदस्य (सरपंच/उपसरपंच)</span>
          </div>
          <p className="text-[11px] text-[#747C76] mt-2 flex items-center justify-between border-t border-[#F0F2EF] pt-2">
            <span>WhatsApp नोटीस प्रणाली</span>
            <ArrowRight className="w-3 h-3 text-[#245C45] group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Card 4: All Mobile No */}
        <Link
          href="/sheets/all-mobile-no"
          className="bg-white border border-[#E1E5E1] rounded-lg p-4 hover:border-[#245C45] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#747C76]">करदाते संपर्क यादी</span>
            <FileSpreadsheet className="w-4 h-4 text-[#245C45]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#252A27]">६८०</span>
            <span className="text-xs text-[#747C76]">नोंदणीकृत नागरिक</span>
          </div>
          <p className="text-[11px] text-[#747C76] mt-2 flex items-center justify-between border-t border-[#F0F2EF] pt-2">
            <span>१०४ पडताळलेले फोन</span>
            <ArrowRight className="w-3 h-3 text-[#245C45] group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>
      </div>

      {/* 4 Statutory Document Generators (Quick Print Hub) */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#252A27]">
              कायदेशीर दस्तावेज व पावती जनरेटर (A4 Printing Hub)
            </h3>
            <p className="text-xs text-[#747C76]">
              स्प्रेडशीटमधील मूळ फॉरमॅटनुसार अधिकृत शासकीय नमुने जनरेट करा
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/sheets/utara"
            className="p-3.5 rounded-lg border border-[#E1E5E1] hover:border-[#245C45] hover:bg-[#F6F7F5] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 rounded bg-[#EAF1EC] text-[#245C45] flex items-center justify-center mb-2 font-bold text-xs">
                ८
              </div>
              <h4 className="text-xs font-bold text-[#252A27]">नमुना ८ उतारा</h4>
              <p className="text-[11px] text-[#747C76] mt-1">
                नियम ३२(१) नुसार मिळकतीचा अधिकृत संगणकीकृत उतारा (A4 PDF)
              </p>
            </div>
            <span className="text-[11px] text-[#245C45] font-semibold mt-3 block">
              उतारा काढा →
            </span>
          </Link>

          <Link
            href="/sheets/magani-bill"
            className="p-3.5 rounded-lg border border-[#E1E5E1] hover:border-[#245C45] hover:bg-[#F6F7F5] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 rounded bg-[#EAF1EC] text-[#245C45] flex items-center justify-center mb-2 font-bold text-xs">
                ब
              </div>
              <h4 className="text-xs font-bold text-[#252A27]">वार्षिक कर मागणी बिल</h4>
              <p className="text-[11px] text-[#747C76] mt-1">
                नमुना ९ वर आधारित थकीत व चालू मागणी बिल (A4 PDF)
              </p>
            </div>
            <span className="text-[11px] text-[#245C45] font-semibold mt-3 block">
              बिल जनरेट करा →
            </span>
          </Link>

          <Link
            href="/sheets/namuna-10-pavati"
            className="p-3.5 rounded-lg border border-[#E1E5E1] hover:border-[#245C45] hover:bg-[#F6F7F5] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 rounded bg-[#EAF1EC] text-[#245C45] flex items-center justify-center mb-2 font-bold text-xs">
                १०
              </div>
              <h4 className="text-xs font-bold text-[#252A27]">नमुना १० कर पावती</h4>
              <p className="text-[11px] text-[#747C76] mt-1">
                नियम २२(१२) नुसार घरकर, पाणीपट्टी अधिकृत वसुली पावती
              </p>
            </div>
            <span className="text-[11px] text-[#245C45] font-semibold mt-3 block">
              पावती तयार करा →
            </span>
          </Link>

          <Link
            href="/sheets/masik-sabha-notice"
            className="p-3.5 rounded-lg border border-[#E1E5E1] hover:border-[#245C45] hover:bg-[#F6F7F5] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 rounded bg-[#EAF1EC] text-[#245C45] flex items-center justify-center mb-2 font-bold text-xs">
                स
              </div>
              <h4 className="text-xs font-bold text-[#252A27]">मासिक सभा नोटीस</h4>
              <p className="text-[11px] text-[#747C76] mt-1">
                ७ अजेंडा विषय व ९ सदस्यांसाठी WhatsApp व छापील नोटीस
              </p>
            </div>
            <span className="text-[11px] text-[#245C45] font-semibold mt-3 block">
              नोटीस पाठवा →
            </span>
          </Link>
        </div>
      </div>

      {/* Complete 26 Worksheets Table */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E1E5E1] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#252A27]">
              सर्व २६ मूळ वर्कशीट्स सूची (Worksheets Directory)
            </h3>
            <p className="text-xs text-[#747C76]">
              स्प्रेडशीटमधील प्रत्येक वर्कशीटकडे थेट जाण्यासाठी खालील सूची वापरा
            </p>
          </div>
          <span className="text-xs bg-[#EAF1EC] text-[#245C45] font-semibold px-2 py-1 rounded">
            एकूण २६ / २६ उपलब्ध
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F7F5] border-b border-[#E1E5E1] text-[#747C76] font-semibold">
              <tr>
                <th className="py-2.5 px-4 w-12">क्र.</th>
                <th className="py-2.5 px-4">वर्कशीटचे मूळ नाव</th>
                <th className="py-2.5 px-4">प्रवर्ग (Category)</th>
                <th className="py-2.5 px-4 text-right">नोंदी (Rows)</th>
                <th className="py-2.5 px-4 text-right">कॉलम्स (Cols)</th>
                <th className="py-2.5 px-4 text-center">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E5E1]">
              {meta.sheets.map((s, idx) => (
                <tr key={s.slug} className="hover:bg-[#F6F7F5] transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[#747C76]">{idx + 1}</td>
                  <td className="py-2.5 px-4 font-medium text-[#252A27] flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#245C45]" />
                    <span>{s.name}</span>
                  </td>
                  <td className="py-2.5 px-4 text-[#747C76]">{s.category}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#252A27]">
                    {s.populated_rows_count}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#747C76]">
                    {s.max_col}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Link
                      href={`/sheets/${s.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#245C45] hover:underline"
                    >
                      उघडा →
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
