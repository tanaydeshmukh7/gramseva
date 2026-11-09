"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Printer,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Save,
  X,
  ExternalLink,
  Info,
  CheckCircle2,
  PhoneCall,
  Send,
  Building2,
  Receipt,
  Users,
} from "lucide-react";
import { SheetData, SheetRow } from "@/lib/types";

interface Props {
  sheetData: SheetData;
}

export default function SheetViewerClient({ sheetData }: Props) {
  const [activeTab, setActiveTab] = useState<"table" | "document">(
    ["utara", "magani-bill", "namuna-10-pavati", "masik-sabha-notice"].includes(sheetData.slug)
      ? "document"
      : "table"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Document specific state
  const [selectedPropertyNo, setSelectedPropertyNo] = useState("6B");
  const [noticeWhatsAppNumber, setNoticeWhatsAppNumber] = useState("");
  const [whatsappSentStatus, setWhatsappSentStatus] = useState<string | null>(null);

  // Edit / Add modal state
  const [editingRow, setEditingRow] = useState<SheetRow | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmRowIndex, setDeleteConfirmRowIndex] = useState<number | null>(null);
  const [rowsState, setRowsState] = useState<SheetRow[]>(sheetData.rows);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rowsState;
    const q = searchTerm.toLowerCase();
    return rowsState.filter((row) =>
      row.cells.some(
        (cell) => cell.value !== null && String(cell.value).toLowerCase().includes(q)
      )
    );
  }, [rowsState, searchTerm]);

  // Paginated rows
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return filteredRows;
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Detect maximum populated columns to build header
  const maxCols = Math.min(sheetData.max_col, 35);
  const colHeaders = useMemo(() => {
    // If first row has labels, use them, otherwise letter
    const firstRow = rowsState[0];
    const headers: { col: number; label: string }[] = [];
    for (let c = 1; c <= maxCols; c++) {
      const cell = firstRow?.cells.find((ce) => ce.col === c);
      headers.push({
        col: c,
        label: cell?.value ? String(cell.value).slice(0, 30) : `स्तंभ ${c}`,
      });
    }
    return headers;
  }, [rowsState, maxCols]);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = (rowIndex: number) => {
    setRowsState((prev) => prev.filter((r) => r.row_index !== rowIndex));
    setDeleteConfirmRowIndex(null);
    showNotification("नोंद यशस्वीरित्या हटवली आहे (Record deleted).");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    setRowsState((prev) =>
      prev.map((r) => (r.row_index === editingRow.row_index ? editingRow : r))
    );
    setEditingRow(null);
    showNotification("बदल जतन केले आहेत (Changes saved successfully).");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 bg-[#245C45] text-white px-4 py-2.5 rounded shadow-lg text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar / Header of Sheet */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-[#EAF1EC] text-[#245C45] font-semibold px-2 py-0.5 rounded">
              वर्कशीट #{sheetData.index} • {sheetData.category}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#252A27] mt-1 flex items-center gap-2">
            <span>{sheetData.name}</span>
          </h2>
          <p className="text-xs text-[#747C76] mt-0.5">
            एकूण नोंदवही: <strong>{rowsState.length}</strong> ओळी •{" "}
            <strong>{sheetData.max_col}</strong> कॉलम्स
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {["utara", "magani-bill", "namuna-10-pavati", "masik-sabha-notice"].includes(
            sheetData.slug
          ) && (
            <div className="flex rounded-md bg-[#F6F7F5] p-1 border border-[#E1E5E1] text-xs">
              <button
                onClick={() => setActiveTab("document")}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === "document"
                    ? "bg-white text-[#245C45] font-semibold shadow-xs"
                    : "text-[#747C76] hover:text-[#252A27]"
                }`}
              >
                दस्तावेज / प्रिंट फॉरमॅट
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === "table"
                    ? "bg-white text-[#245C45] font-semibold shadow-xs"
                    : "text-[#747C76] hover:text-[#252A27]"
                }`}
              >
                स्प्रेडशीट तक्ता दृश्य
              </button>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#E1E5E1] hover:bg-[#F6F7F5] text-xs font-medium text-[#252A27] shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#245C45]" />
            <span>प्रिंट / PDF (A4)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#245C45] text-white hover:bg-[#1b4534] text-xs font-medium shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नवीन नोंद जोडा</span>
          </button>
        </div>
      </div>

      {/* SPECIAL VIEW: DOCUMENT GENERATION TAB */}
      {activeTab === "document" && (
        <div className="bg-white border border-[#E1E5E1] rounded-lg p-6 shadow-xs printable-card">
          {/* UTARA DOCUMENT */}
          {sheetData.slug === "utara" && (
            <div className="space-y-6">
              {/* Selector / Search Property Input */}
              <div className="no-print bg-[#F6F7F5] p-3 rounded-lg border border-[#E1E5E1] flex items-center gap-3">
                <span className="text-xs font-semibold text-[#252A27]">
                  🔍 मालमत्ता क्र. टाका :
                </span>
                <input
                  type="text"
                  value={selectedPropertyNo}
                  onChange={(e) => setSelectedPropertyNo(e.target.value)}
                  placeholder="उदा. 1, 2, 5A, 6B"
                  className="bg-white border border-[#E1E5E1] rounded px-3 py-1 text-xs font-mono font-bold text-[#245C45] w-36 focus:outline-none focus:border-[#245C45]"
                />
                <span className="text-xs text-[#747C76]">
                  (क्रमांक टाईप केल्यावर उतारा तात्काळ तयार होतो)
                </span>
              </div>

              {/* Printable Namuna 8 Extract Sheet */}
              <div className="border-2 border-[#252A27] p-6 text-center space-y-4 bg-white text-[#252A27]">
                <div className="border-b border-[#252A27] pb-3 space-y-1">
                  <h3 className="text-base font-bold">नमुना नंबर ८ उतारा</h3>
                  <p className="text-xs font-medium">नियम ३२ (१)</p>
                  <p className="text-xs">
                    सन २०२६ - २०२७ ते २०२९ - २०३० या वर्षासाठी आकारणी नोंदवहीचा उतारा
                  </p>
                  <h4 className="text-sm font-bold mt-1">
                    ग्रामपंचायत कार्यालय, गोहगाव • तालुका : रिसोड • जिल्हा : वाशिम
                  </h4>
                </div>

                <div className="overflow-x-auto text-left text-xs">
                  <table className="w-full border-collapse border border-[#252A27]">
                    <tbody>
                      <tr className="border-b border-[#252A27]">
                        <td className="p-2 font-semibold border-r border-[#252A27] w-1/4 bg-[#F6F7F5]">
                          मालमत्ता क्रमांक
                        </td>
                        <td className="p-2 font-mono font-bold text-[#245C45] w-1/4 border-r border-[#252A27]">
                          {selectedPropertyNo}
                        </td>
                        <td className="p-2 font-semibold border-r border-[#252A27] w-1/4 bg-[#F6F7F5]">
                          सिटी सर्व्हे नंबर
                        </td>
                        <td className="p-2 w-1/4 font-mono">-</td>
                      </tr>
                      <tr className="border-b border-[#252A27]">
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          मालकाचे नाव
                        </td>
                        <td className="p-2 font-bold border-r border-[#252A27]" colSpan={3}>
                          {selectedPropertyNo === "6B"
                            ? "ऋषिकेश मिलिंद हाडे"
                            : selectedPropertyNo === "1"
                            ? "प्रल्हाद गोविंदा हाडे"
                            : selectedPropertyNo === "2"
                            ? "अशोक ज्ञानबा काठोळे"
                            : "नोंदणीकृत मालक (गोहगाव)"}
                        </td>
                      </tr>
                      <tr className="border-b border-[#252A27]">
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          मालमत्तेचे वर्णन
                        </td>
                        <td className="p-2 border-r border-[#252A27]">
                          नवीन आर सी सी पद्धतीचे घर
                        </td>
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          बांधकामाचे वर्ष
                        </td>
                        <td className="p-2">२ पेक्षा जास्त व ५ वर्ष पर्यंत</td>
                      </tr>
                      <tr className="border-b border-[#252A27]">
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          क्षेत्रफळ (लांबी × रुंदी)
                        </td>
                        <td className="p-2 border-r border-[#252A27]">
                          २५ × ३० = ७५० चौ.फूट
                        </td>
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          क्षेत्रफळ चौ.मी.
                        </td>
                        <td className="p-2 font-mono">६९.६७ चौ.मी.</td>
                      </tr>
                      <tr className="border-b border-[#252A27]">
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          भांडवली मूल्य (रुपये)
                        </td>
                        <td className="p-2 font-bold font-mono border-r border-[#252A27]">
                          ₹६८,०००/-
                        </td>
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          कराचा दर
                        </td>
                        <td className="p-2 font-mono">१.२० पैसे</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Tax Distribution Breakdown */}
                  <h5 className="font-bold text-xs mt-4 mb-2">वार्षिक कर आकारणी तपशील :</h5>
                  <table className="w-full border-collapse border border-[#252A27] text-center">
                    <thead className="bg-[#F6F7F5] font-semibold border-b border-[#252A27]">
                      <tr>
                        <th className="p-2 border-r border-[#252A27]">घरपट्टी कर</th>
                        <th className="p-2 border-r border-[#252A27]">दिवाबत्ती कर</th>
                        <th className="p-2 border-r border-[#252A27]">आरोग्य कर</th>
                        <th className="p-2 border-r border-[#252A27]">पाणीपट्टी कर</th>
                        <th className="p-2 font-bold">एकूण वार्षिक कर</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-mono">
                        <td className="p-2 border-r border-[#252A27]">₹८१६/-</td>
                        <td className="p-2 border-r border-[#252A27]">₹३०/-</td>
                        <td className="p-2 border-r border-[#252A27]">₹३०/-</td>
                        <td className="p-2 border-r border-[#252A27]">₹०/-</td>
                        <td className="p-2 font-bold text-[#245C45]">₹८७६/-</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Boundaries */}
                  <div className="grid grid-cols-4 gap-2 border border-[#252A27] p-2 mt-3 text-center">
                    <div>
                      <span className="font-semibold block">पूर्व :</span> शेतजमीन
                    </div>
                    <div>
                      <span className="font-semibold block">पश्चिम :</span> ग्राम रस्ता
                    </div>
                    <div>
                      <span className="font-semibold block">उत्तर :</span> श्री. हाडे घर
                    </div>
                    <div>
                      <span className="font-semibold block">दक्षिण :</span> मोकळी जागा
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-10 flex items-center justify-between text-xs font-semibold px-4">
                  <div className="text-center">
                    <div className="h-10" />
                    <p>कर वसुली लिपिक</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div className="text-center">
                    <div className="h-10" />
                    <p>ग्रामसेवक / ग्रा.वि.अ.</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div className="text-center">
                    <div className="h-10" />
                    <p>सरपंच / उपसरपंच</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAGANI BILL */}
          {sheetData.slug === "magani-bill" && (
            <div className="space-y-6">
              {/* Input Property */}
              <div className="no-print bg-[#F6F7F5] p-3 rounded-lg border border-[#E1E5E1] flex items-center gap-3">
                <span className="text-xs font-semibold text-[#252A27]">
                  🔍 मिळकत क्र. बदला :
                </span>
                <input
                  type="text"
                  value={selectedPropertyNo}
                  onChange={(e) => setSelectedPropertyNo(e.target.value)}
                  placeholder="उदा. 6B"
                  className="bg-white border border-[#E1E5E1] rounded px-3 py-1 text-xs font-mono font-bold text-[#245C45] w-28 focus:outline-none focus:border-[#245C45]"
                />
              </div>

              {/* Printable Demand Bill */}
              <div className="border-2 border-[#252A27] p-6 space-y-4 bg-white text-[#252A27]">
                <div className="text-center border-b border-[#252A27] pb-3 space-y-1">
                  <h3 className="text-base font-bold">ग्रामपंचायत कार्यालय, गोहगाव</h3>
                  <p className="text-xs font-medium">
                    वार्षिक कर मागणी बिल (सन २०२६ - २०२७)
                  </p>
                  <p className="text-[11px] text-[#747C76]">
                    तालुका : रिसोड, जिल्हा : वाशिम
                  </p>
                </div>

                <div className="flex justify-between text-xs font-medium border-b border-[#E1E5E1] pb-2">
                  <div>
                    <p>
                      बिल क्रमांक : <strong>ब-{selectedPropertyNo}</strong>
                    </p>
                    <p className="mt-1">
                      करदात्याचे नाव :{" "}
                      <strong>
                        {selectedPropertyNo === "6B"
                          ? "ऋषिकेश मिलिंद हाडे"
                          : "श्री. प्रल्हाद गोविंदा हाडे"}
                      </strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      बिल दिनांक : <strong>०९/११/२०२६</strong>
                    </p>
                    <p className="mt-1">
                      मिळकत क्रमांक : <strong>{selectedPropertyNo}</strong>
                    </p>
                  </div>
                </div>

                <table className="w-full border-collapse border border-[#252A27] text-xs">
                  <thead className="bg-[#F6F7F5] border-b border-[#252A27]">
                    <tr>
                      <th className="p-2 border-r border-[#252A27] w-12 text-center">अ.क्र.</th>
                      <th className="p-2 border-r border-[#252A27] text-left">
                        कराचा तपशील / बाबी
                      </th>
                      <th className="p-2 border-r border-[#252A27] text-right">
                        मागील थकीत (₹)
                      </th>
                      <th className="p-2 border-r border-[#252A27] text-right">
                        चालू मागणी (₹)
                      </th>
                      <th className="p-2 text-right">एकूण देय कर (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E1E5E1]">
                      <td className="p-2 text-center border-r border-[#252A27]">१</td>
                      <td className="p-2 border-r border-[#252A27]">
                        इमारत व जमीन कर (घरकर)
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">०</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">८१६</td>
                      <td className="p-2 text-right font-mono font-bold">८१६</td>
                    </tr>
                    <tr className="border-b border-[#E1E5E1]">
                      <td className="p-2 text-center border-r border-[#252A27]">२</td>
                      <td className="p-2 border-r border-[#252A27]">
                        दिवाबत्ती कर (दिवाकर)
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">०</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">३०</td>
                      <td className="p-2 text-right font-mono font-bold">३०</td>
                    </tr>
                    <tr className="border-b border-[#E1E5E1]">
                      <td className="p-2 text-center border-r border-[#252A27]">३</td>
                      <td className="p-2 border-r border-[#252A27]">
                        सामान्य आरोग्य कर (सफाई कर)
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">०</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">३०</td>
                      <td className="p-2 text-right font-mono font-bold">३०</td>
                    </tr>
                    <tr className="border-b border-[#252A27]">
                      <td className="p-2 text-center border-r border-[#252A27]">४</td>
                      <td className="p-2 border-r border-[#252A27]">सामान्य पाणीपट्टी कर</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">०</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">०</td>
                      <td className="p-2 text-right font-mono font-bold">०</td>
                    </tr>
                    <tr className="bg-[#F6F7F5] font-bold border-b border-[#252A27]">
                      <td className="p-2 text-center border-r border-[#252A27]" colSpan={2}>
                        एकूण देय कर रक्कम
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">₹०</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">₹८७६</td>
                      <td className="p-2 text-right font-mono text-[#245C45] text-sm">
                        ₹८७६/-
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-xs bg-[#F6F7F5] p-2.5 rounded border border-[#E1E5E1]">
                  <strong>अक्षरी रक्कम :</strong> रुपये आठशे शहात्तर /- फक्त
                </div>

                <div className="pt-8 flex items-center justify-between text-xs font-semibold px-4">
                  <div className="text-center">
                    <p>कर वसुली लिपिक</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div className="text-center">
                    <p>ग्रामसेवक / ग्रा.वि.अ.</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div className="text-center">
                    <p>सरपंच / उपसरपंच</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NAMUNA 10 PAVATI */}
          {sheetData.slug === "namuna-10-pavati" && (
            <div className="space-y-6">
              <div className="no-print bg-[#F6F7F5] p-3 rounded-lg border border-[#E1E5E1] flex items-center gap-3">
                <span className="text-xs font-semibold text-[#252A27]">
                  🔍 मिळकत क्र. टाका :
                </span>
                <input
                  type="text"
                  value={selectedPropertyNo}
                  onChange={(e) => setSelectedPropertyNo(e.target.value)}
                  placeholder="उदा. 6B"
                  className="bg-white border border-[#E1E5E1] rounded px-3 py-1 text-xs font-mono font-bold text-[#245C45] w-28 focus:outline-none focus:border-[#245C45]"
                />
              </div>

              {/* Receipt Body */}
              <div className="border-2 border-[#252A27] p-6 space-y-4 bg-white text-[#252A27]">
                <div className="text-center border-b border-[#252A27] pb-3 space-y-1">
                  <h3 className="text-base font-bold">ग्रामपंचायत कार्यालय, गोहगाव</h3>
                  <p className="text-xs font-semibold">
                    नमुना १० (नियम २२ (१२) पहा) - कर व फी वसुली पावती
                  </p>
                  <p className="text-xs">आर्थिक वर्ष : २०२६ - २०२७</p>
                </div>

                <div className="flex justify-between text-xs font-medium border-b border-[#E1E5E1] pb-2">
                  <div>
                    <p>
                      पावती क्रमांक : <strong>पा-{selectedPropertyNo}</strong>
                    </p>
                    <p className="mt-1">
                      करदात्याचे नाव :{" "}
                      <strong>
                        {selectedPropertyNo === "6B"
                          ? "ऋषिकेश मिलिंद हाडे"
                          : "श्री. प्रल्हाद गोविंदा हाडे"}
                      </strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      पावती दिनांक : <strong>०९/११/२०२६</strong>
                    </p>
                    <p className="mt-1">
                      मिळकत क्रमांक : <strong>{selectedPropertyNo}</strong>
                    </p>
                  </div>
                </div>

                <table className="w-full border-collapse border border-[#252A27] text-xs">
                  <thead className="bg-[#F6F7F5] border-b border-[#252A27]">
                    <tr>
                      <th className="p-2 border-r border-[#252A27] w-12 text-center">अ.क्र.</th>
                      <th className="p-2 border-r border-[#252A27] text-left">कराचा तपशील</th>
                      <th className="p-2 border-r border-[#252A27] text-right">देय कर (₹)</th>
                      <th className="p-2 text-right">वसूल रक्कम (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E1E5E1]">
                      <td className="p-2 text-center border-r border-[#252A27]">१</td>
                      <td className="p-2 border-r border-[#252A27]">इमारत व जमीन कर (घरकर)</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">८१६</td>
                      <td className="p-2 text-right font-mono font-bold">८१६</td>
                    </tr>
                    <tr className="border-b border-[#E1E5E1]">
                      <td className="p-2 text-center border-r border-[#252A27]">२</td>
                      <td className="p-2 border-r border-[#252A27]">दिवाबत्ती कर (दिवाकर)</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">३०</td>
                      <td className="p-2 text-right font-mono font-bold">३०</td>
                    </tr>
                    <tr className="border-b border-[#E1E5E1]">
                      <td className="p-2 text-center border-r border-[#252A27]">३</td>
                      <td className="p-2 border-r border-[#252A27]">आरोग्य कर (सफाई कर)</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">३०</td>
                      <td className="p-2 text-right font-mono font-bold">३०</td>
                    </tr>
                    <tr className="bg-[#F6F7F5] font-bold border-b border-[#252A27]">
                      <td className="p-2 text-center border-r border-[#252A27]" colSpan={2}>
                        एकूण वसूल रक्कम
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">₹८७६</td>
                      <td className="p-2 text-right font-mono text-[#2E7D32] text-sm">
                        ₹८७६/-
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between items-center text-xs bg-[#F6F7F5] p-2.5 rounded border border-[#E1E5E1]">
                  <span>
                    <strong>अक्षरी :</strong> रुपये आठशे शहात्तर /- फक्त
                  </span>
                  <span className="font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">
                    पूर्ण भरणा (PAID)
                  </span>
                </div>

                <div className="pt-8 flex items-center justify-between text-xs font-semibold px-4">
                  <div className="text-center">
                    <p>कर वसुली लिपिक</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div className="text-center">
                    <p>ग्रामसेवक / ग्रा.वि.अ.</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div className="text-center">
                    <p>सरपंच / उपसरपंच</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MASIK SABHA NOTICE & WHATSAPP HUB */}
          {sheetData.slug === "masik-sabha-notice" && (
            <div className="space-y-6">
              {/* WhatsApp Sender Banner */}
              <div className="no-print bg-[#EAF1EC] p-4 rounded-lg border border-[#cbe0d3] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-[#245C45] flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp मासिक सभा नोटीस डिस्पॅच केंद्र</span>
                  </h4>
                  <p className="text-[11px] text-[#747C76] mt-0.5">
                    फक्त खालील तक्त्यातील ९ निवडून आलेल्या सदस्यांनाच नोटीस पाठवली जाते.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setWhatsappSentStatus("सर्व ९ सदस्यांना नोटीस तयार करण्यात आली आहे.");
                    setTimeout(() => setWhatsappSentStatus(null), 4000);
                  }}
                  className="px-3 py-1.5 bg-[#245C45] text-white rounded text-xs font-medium hover:bg-[#1b4534] shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>सर्व सदस्यांना नोटीस पाठवा (Bulk WhatsApp)</span>
                </button>
              </div>

              {whatsappSentStatus && (
                <div className="no-print bg-[#E8F5E9] text-[#2E7D32] p-2.5 rounded text-xs font-medium border border-[#A5D6A7]">
                  ✓ {whatsappSentStatus}
                </div>
              )}

              {/* Printable Notice */}
              <div className="border-2 border-[#252A27] p-6 space-y-4 bg-white text-[#252A27]">
                <div className="text-center border-b border-[#252A27] pb-3 space-y-1">
                  <h3 className="text-base font-bold">ग्रामपंचायत कार्यालय, गोहगाव</h3>
                  <p className="text-xs font-bold">मासिक सभा नोटीस (सन २०२६ - २०२७)</p>
                  <p className="text-[11px] text-[#747C76]">तालुका : रिसोड, जिल्हा : वाशिम</p>
                </div>

                <div className="flex justify-between text-xs border-b border-[#E1E5E1] pb-2">
                  <span>जावक क्र. : ग्रा.पं.गोह/सभा/२०२६-२७/२८</span>
                  <span>दिनांक : ०९/११/२०२६</span>
                </div>

                <p className="text-xs leading-relaxed">
                  <strong>प्रति,</strong> मा. सरपंच / उपसरपंच / सर्व सन्माननीय सदस्य,
                  ग्रामपंचायत गोहगाव.
                  <br />
                  <strong>महोदय / महोदया,</strong> ग्रामपंचायत अधिनियम, १९५८ अन्वये ग्रामपंचायत
                  गोहगावची माहे नोव्हेंबर २०२६ ची मासिक सभा खालील तपशिलानुसार आयोजित करण्यात आली
                  आहे. तरी सभेस सर्व सदस्यांनी वेळेवर उपस्थित राहावे ही नम्र विनंती.
                </p>

                {/* Meeting Details Card */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#F6F7F5] p-3 rounded border border-[#E1E5E1]">
                  <div>📅 सभेचा दिनांक : <strong>१५/११/२०२६</strong></div>
                  <div>⏰ सभेची वेळ : <strong>दुपारी ०२:०० वाजता</strong></div>
                  <div>📍 सभेचे ठिकाण : <strong>ग्रामपंचायत कार्यालय, गोहगाव</strong></div>
                  <div>👤 सभेचे अध्यक्ष : <strong>मा. सरपंच, ग्रा.पं. गोहगाव</strong></div>
                </div>

                {/* Agenda */}
                <div>
                  <h4 className="font-bold text-xs mb-2">📋 सभेची विषयपत्रिका (अजेंडा) :</h4>
                  <table className="w-full border-collapse border border-[#252A27] text-xs">
                    <thead className="bg-[#F6F7F5] border-b border-[#252A27]">
                      <tr>
                        <th className="p-1.5 border-r border-[#252A27] w-10 text-center">क्र.</th>
                        <th className="p-1.5 border-r border-[#252A27] text-left">विषय</th>
                        <th className="p-1.5 border-r border-[#252A27] text-left">
                          सविस्तर तपशील / चर्चा
                        </th>
                        <th className="p-1.5 text-center w-20">शेरा</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252A27]">
                      <tr>
                        <td className="p-1.5 text-center border-r border-[#252A27]">१</td>
                        <td className="p-1.5 border-r border-[#252A27] font-semibold">
                          मागील सभेचे इतिवृत्त वाचन
                        </td>
                        <td className="p-1.5 border-r border-[#252A27]">
                          दि. १५/१०/२०२६ च्या सभेचे इतिवृत्त (प्रोसिडिंग) वाचून कायम करणे.
                        </td>
                        <td className="p-1.5 text-center">नियमित</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-center border-r border-[#252A27]">२</td>
                        <td className="p-1.5 border-r border-[#252A27] font-semibold">
                          मागील माहे जमा-खर्च मंजुरी
                        </td>
                        <td className="p-1.5 border-r border-[#252A27]">
                          माहे ऑक्टोबर २०२६ मधील ग्रामनिधी व इतर योजना जमा-खर्च आढावा घेणे.
                        </td>
                        <td className="p-1.5 text-center">मंजुरीसाठी</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-center border-r border-[#252A27]">३</td>
                        <td className="p-1.5 border-r border-[#252A27] font-semibold">
                          कर वसुली आढावा व मोहीम
                        </td>
                        <td className="p-1.5 border-r border-[#252A27]">
                          नमुना ८ नुसार घरपट्टी, पाणीपट्टी कर वसुली १००% करण्यासाठी मोहीम आखणे.
                        </td>
                        <td className="p-1.5 text-center">वसुली मोहीम</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-center border-r border-[#252A27]">४</td>
                        <td className="p-1.5 border-r border-[#252A27] font-semibold">
                          स्वच्छता व दिवाबत्ती दुरुस्ती
                        </td>
                        <td className="p-1.5 border-r border-[#252A27]">
                          गावातील अंतर्गत रस्ते, नाले स्वच्छता व नादुरुस्त पथदिवे दुरुस्ती करणे.
                        </td>
                        <td className="p-1.5 text-center">जनसुविधा</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-center border-r border-[#252A27]">५</td>
                        <td className="p-1.5 border-r border-[#252A27] font-semibold">
                          विकासकामे व १५ वा वित्त आयोग
                        </td>
                        <td className="p-1.5 border-r border-[#252A27]">
                          वार्षिक आराखड्यातील मंजूर विकासकामांना प्रशासकीय मंजुरी देणे.
                        </td>
                        <td className="p-1.5 text-center">विकासकामे</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-center border-r border-[#252A27]">६</td>
                        <td className="p-1.5 border-r border-[#252A27] font-semibold">
                          नागरिकांचे अर्ज व दाखले
                        </td>
                        <td className="p-1.5 border-r border-[#252A27]">
                          नागरिकांचे नमुना ८ नोंद, नाव दुरुस्ती, पाणीपट्टी व बांधकाम परवानग्या.
                        </td>
                        <td className="p-1.5 text-center">प्रशासकीय</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-center border-r border-[#252A27]">७</td>
                        <td className="p-1.5 border-r border-[#252A27] font-semibold">
                          अध्यक्षांच्या परवानगीने ऐनवेळचे विषय
                        </td>
                        <td className="p-1.5 border-r border-[#252A27]">
                          सभेच्या दिवशी ऐनवेळी येणाऱ्या तातडीच्या व सार्वजनिक विषयांवर चर्चा करणे.
                        </td>
                        <td className="p-1.5 text-center">ऐनवेळचे</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Member Attendance & Signature List */}
                <div>
                  <h4 className="font-bold text-xs mb-2">
                    ✍️ सदस्य नोटीस पोच स्वाक्षरी तक्ता (९ सदस्य) :
                  </h4>
                  <table className="w-full border-collapse border border-[#252A27] text-xs">
                    <thead className="bg-[#F6F7F5] border-b border-[#252A27]">
                      <tr>
                        <th className="p-1.5 border-r border-[#252A27] w-8 text-center">क्र.</th>
                        <th className="p-1.5 border-r border-[#252A27] text-left">सदस्याचे नाव</th>
                        <th className="p-1.5 border-r border-[#252A27] text-left">पद / प्रभाग</th>
                        <th className="p-1.5 border-r border-[#252A27] text-center w-28">
                          मोबाईल क्र.
                        </th>
                        <th className="p-1.5 text-center w-36">नोटीस पोच स्वाक्षरी</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252A27]">
                      {[
                        { sr: 1, name: "श्री. रमेश किसनराव पाटील", role: "सरपंच", mob: "98XXXXXXXX" },
                        { sr: 2, name: "सौ. सुनिता विलास मोरे", role: "उपसरपंच (प्रभाग १)", mob: "97XXXXXXXX" },
                        { sr: 3, name: "श्री. ऋषिकेश मिलिंद हाडे", role: "सदस्य (प्रभाग १)", mob: "98XXXXXXXX" },
                        { sr: 4, name: "सौ. मंगल ज्ञानेश्वर पवार", role: "सदस्य (प्रभाग २)", mob: "96XXXXXXXX" },
                        { sr: 5, name: "श्री. सचिन मारुती कदम", role: "सदस्य (प्रभाग २)", mob: "95XXXXXXXX" },
                        { sr: 6, name: "सौ. अर्चना बाळकृष्ण जाधव", role: "सदस्य (प्रभाग ३)", mob: "94XXXXXXXX" },
                        { sr: 7, name: "श्री. गजानन शंकरराव शिंदे", role: "सदस्य (प्रभाग ३)", mob: "93XXXXXXXX" },
                        { sr: 8, name: "सौ. प्रियंका अमोल काळे", role: "सदस्य (प्रभाग ४)", mob: "92XXXXXXXX" },
                        { sr: 9, name: "श्री. समाधान पंढरीनाथ गाडे", role: "सदस्य (प्रभाग ४)", mob: "91XXXXXXXX" },
                      ].map((m) => (
                        <tr key={m.sr}>
                          <td className="p-1.5 text-center border-r border-[#252A27]">{m.sr}</td>
                          <td className="p-1.5 border-r border-[#252A27] font-semibold">{m.name}</td>
                          <td className="p-1.5 border-r border-[#252A27]">{m.role}</td>
                          <td className="p-1.5 border-r border-[#252A27] text-center font-mono">
                            {m.mob}
                          </td>
                          <td className="p-1.5 text-center text-[#747C76]">
                            स्वाक्षरी : ________________
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-6 flex items-center justify-between text-xs font-semibold px-4">
                  <div className="text-center">
                    <p>ग्रामसेवक / ग्रा.वि.अ.</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div className="text-center">
                    <p>नोटीस बजावणारा कर्मचारी</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div className="text-center">
                    <p>सरपंच / उपसरपंच</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SPREADSHEET TABLE GRID VIEW */}
      {activeTab === "table" && (
        <div className="bg-white border border-[#E1E5E1] rounded-lg overflow-hidden shadow-xs">
          {/* Controls Bar: Search & Pagination Selector */}
          <div className="p-3 border-b border-[#E1E5E1] bg-[#F6F7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#747C76]" />
              <input
                type="text"
                placeholder="नोंद किंवा मूल्य शोधा (Search any value)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E1E5E1] rounded focus:outline-none focus:border-[#245C45]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-[#747C76]">
              <span>दर्शवा:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#E1E5E1] rounded px-2 py-1 text-xs focus:outline-none"
              >
                <option value={25}>२५ नोंदी</option>
                <option value={50}>५० नोंदी</option>
                <option value={100}>१०० नोंदी</option>
                <option value={-1}>सर्व नोंदी</option>
              </select>
              <span>(एकूण: {filteredRows.length})</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F0F2EF] sticky top-0 z-10 border-b border-[#E1E5E1] text-[#252A27] font-semibold">
                <tr>
                  <th className="py-2 px-3 border-r border-[#E1E5E1] w-14 text-center">
                    ओळ
                  </th>
                  {colHeaders.map((col) => (
                    <th
                      key={col.col}
                      className="py-2 px-3 border-r border-[#E1E5E1] whitespace-nowrap min-w-[120px]"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="py-2 px-3 text-center w-20 sticky right-0 bg-[#F0F2EF]">
                    कृती
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E5E1]">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={colHeaders.length + 2}
                      className="py-8 text-center text-[#747C76]"
                    >
                      कोणतीही नोंद सापडली नाही.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.row_index}
                      className="hover:bg-[#F6F7F5] transition-colors group"
                    >
                      <td className="py-1.5 px-3 border-r border-[#E1E5E1] text-center font-mono text-[11px] text-[#747C76] bg-[#FAFBFA]">
                        {row.row_index}
                      </td>
                      {colHeaders.map((col) => {
                        const cell = row.cells.find((c) => c.col === col.col);
                        const val = cell?.value;
                        const hasFormula = cell?.is_formula;
                        return (
                          <td
                            key={col.col}
                            className="py-1.5 px-3 border-r border-[#E1E5E1] whitespace-nowrap font-sans text-[12px] text-[#252A27]"
                            title={
                              hasFormula
                                ? `Formula: ${cell.formula}`
                                : val !== null
                                ? String(val)
                                : ""
                            }
                          >
                            <span
                              className={
                                hasFormula
                                  ? "border-b border-dashed border-[#245C45] cursor-help"
                                  : ""
                              }
                            >
                              {val !== null && val !== undefined ? String(val) : ""}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-1.5 px-3 text-center sticky right-0 bg-white group-hover:bg-[#F6F7F5]">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingRow(row)}
                            className="p-1 text-[#747C76] hover:text-[#245C45] rounded"
                            title="संपादित करा"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmRowIndex(row.row_index)}
                            className="p-1 text-[#747C76] hover:text-rose-600 rounded"
                            title="हटवा"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pageSize !== -1 && totalPages > 1 && (
            <div className="p-3 border-t border-[#E1E5E1] bg-white flex items-center justify-between text-xs text-[#747C76]">
              <span>
                पान <strong>{currentPage}</strong> पैकी <strong>{totalPages}</strong>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded border border-[#E1E5E1] hover:bg-[#F6F7F5] disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded border border-[#E1E5E1] hover:bg-[#F6F7F5] disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT ROW MODAL */}
      {editingRow && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E1E5E1] max-w-2xl w-full p-5 space-y-4 max-h-[85vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E1E5E1] pb-3">
              <h3 className="text-sm font-bold text-[#252A27]">
                नोंद संपादित करा (ओळ #{editingRow.row_index})
              </h3>
              <button
                onClick={() => setEditingRow(null)}
                className="text-[#747C76] hover:text-[#252A27]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto space-y-3 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {colHeaders.slice(0, 15).map((col) => {
                  const cell = editingRow.cells.find((c) => c.col === col.col);
                  return (
                    <div key={col.col} className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#747C76] block">
                        {col.label} {cell?.is_formula && "(Formula Cell)"}
                      </label>
                      <input
                        type="text"
                        defaultValue={cell?.value !== null ? String(cell?.value) : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updatedCells = [...editingRow.cells];
                          const targetCell = updatedCells.find((c) => c.col === col.col);
                          if (targetCell) {
                            targetCell.value = val;
                          } else {
                            updatedCells.push({
                              col: col.col,
                              coord: `C${col.col}`,
                              value: val,
                              is_formula: false,
                              formula: null,
                            });
                          }
                          setEditingRow({ ...editingRow, cells: updatedCells });
                        }}
                        className="w-full px-2.5 py-1.5 border border-[#E1E5E1] rounded text-xs focus:outline-none focus:border-[#245C45]"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#E1E5E1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-3 py-1.5 rounded border border-[#E1E5E1] text-xs font-medium text-[#747C76] hover:bg-[#F6F7F5]"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#245C45] text-white text-xs font-medium hover:bg-[#1b4534]"
                >
                  बदल जतन करा (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmRowIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E1E5E1] max-w-sm w-full p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-[#252A27]">नोंद हटवण्याची पुष्टी करा</h3>
            <p className="text-xs text-[#747C76]">
              तुम्हाला ओळ <strong>#{deleteConfirmRowIndex}</strong> निश्चितपणे हटवायची आहे का?
              हा बदल स्प्रेडशीटमध्ये देखील परावर्तित होईल.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmRowIndex(null)}
                className="px-3 py-1.5 rounded border border-[#E1E5E1] text-xs font-medium text-[#747C76] hover:bg-[#F6F7F5]"
              >
                रद्द करा
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmRowIndex)}
                className="px-3 py-1.5 rounded bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
              >
                होय, हटवा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
