"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { SheetData, SheetRow } from "@/lib/types";
import { normalizeSearchString, searchRows } from "@/lib/searchUtils";
import { useDebounce } from "@/lib/useDebounce";
import PropertySearchBox from "@/components/PropertySearchBox";
import UtaraDocument from "@/components/documents/UtaraDocument";
import MaganiBillDocument from "@/components/documents/MaganiBillDocument";
import Namuna10Document from "@/components/documents/Namuna10Document";
import Namuna7Document, { Namuna7FormState } from "@/components/documents/Namuna7Document";

export function getKolkataPrintTimestamp(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, "0");
  return `${day}/${month}/${year} ${strHours}:${minutes}:${seconds} ${ampm}`;
}

interface Props {
  sheetData: SheetData;
}

export default function SheetViewerClient({ sheetData }: Props) {
  const isDocumentSheet = [
    "utara",
    "magani-bill",
    "namuna-10-pavati",
    "namuna-7-pavati",
    "masik-sabha-notice",
  ].includes(sheetData.slug);

  const [activeTab, setActiveTab] = useState<"table" | "document">(
    isDocumentSheet ? "document" : "table"
  );

  // Search and Pagination State
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, isSearching] = useDebounce(searchInput, 150);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Rows and Persistence State
  const [rowsState, setRowsState] = useState<SheetRow[]>(sheetData.rows);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Document Generator Lookup State
  const [selectedPropertyNo, setSelectedPropertyNo] = useState(
    sheetData.slug === "namuna-10-pavati" ? "1" : "6B"
  );
  const [debouncedPropertyNo, isPropertyDebouncing] = useDebounce(selectedPropertyNo.trim(), 200);
  const propertyCacheRef = useRef<Map<string, any>>(new Map());
  const [propertyData, setPropertyData] = useState<any>(null);
  const [isPropertyLoading, setIsPropertyLoading] = useState(false);
  const [propertyLookupError, setPropertyLookupError] = useState<string | null>(null);

  // Real-time Asia/Kolkata Print Timestamp & Preview State
  const [printTimestamp, setPrintTimestamp] = useState<string>("");
  const [isPrintPreview, setIsPrintPreview] = useState<boolean>(false);

  // Namuna 10 Pavati Specific State
  const [n10ReceiptDate, setN10ReceiptDate] = useState<string>("");
  const [n10ReceiptNo, setN10ReceiptNo] = useState<string>("");
  const [n10PaymentMode, setN10PaymentMode] = useState<string>("रोख (Cash) / ऑनलाइन");

  useEffect(() => {
    const ts = getKolkataPrintTimestamp();
    setPrintTimestamp(ts);
    setN10ReceiptDate(ts);
  }, []);

  // Sync print timestamp dynamically on window print event
  useEffect(() => {
    const handleBeforePrint = () => {
      setPrintTimestamp(getKolkataPrintTimestamp());
    };
    window.addEventListener("beforeprint", handleBeforePrint);
    return () => window.removeEventListener("beforeprint", handleBeforePrint);
  }, []);

  // Namuna 7 Specific State
  const [namuna7Data, setNamuna7Data] = useState<Namuna7FormState>({
    bookNo: "ब-०१",
    receiptNo: "पा-०२६",
    date: "१०/११/२०२६",
    financialYear: "२०२६ - २०२७",
    payerName: "प्रल्हाद गोविंदा हाडे",
    address: "गोहगाव",
    reason: "दाखले फी (जन्म/मृत्यू/रहिवासी)",
    accountHead: "सामान्य फंड / दाखला फी",
    amount: "100",
    amountWords: "रुपये एकशे /- फक्त",
    paymentMode: "रोख (Cash)",
    referenceNo: "",
    bankName: "",
    mobileNo: "9763944767",
    aadhaarNo: "123456785241",
  });

  // Autofill Namuna 7 when property is loaded
  useEffect(() => {
    if (sheetData.slug === "namuna-7-pavati" && propertyData) {
      setNamuna7Data((prev) => ({
        ...prev,
        payerName: propertyData.owner_name || prev.payerName,
        address: propertyData.street_name || prev.address,
        mobileNo: propertyData.mobile_no || prev.mobileNo,
        aadhaarNo: propertyData.aadhaar_no || prev.aadhaarNo,
      }));
    }
  }, [propertyData, sheetData.slug]);

  // Autofill Namuna 10 Receipt No when property changes
  useEffect(() => {
    if (sheetData.slug === "namuna-10-pavati" && propertyData?.property_no) {
      setN10ReceiptNo(`पा-${propertyData.property_no}`);
    }
  }, [propertyData, sheetData.slug]);

  // WhatsApp Dispatch State
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappResult, setWhatsappResult] = useState<any>(null);

  // Edit / Add Modal State
  const [editingRow, setEditingRow] = useState<SheetRow | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRowValues, setNewRowValues] = useState<Record<number, string>>({});
  const [deleteConfirmRowIndex, setDeleteConfirmRowIndex] = useState<number | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch real property details when in document view with debounce, caching, and abort controller
  useEffect(() => {
    if (
      ["utara", "magani-bill", "namuna-10-pavati", "namuna-7-pavati"].includes(sheetData.slug) &&
      debouncedPropertyNo
    ) {
      const cacheKey = debouncedPropertyNo.toLowerCase();
      if (propertyCacheRef.current.has(cacheKey)) {
        setPropertyData(propertyCacheRef.current.get(cacheKey));
        setIsPropertyLoading(false);
        setPropertyLookupError(null);
        return;
      }

      const controller = new AbortController();
      setIsPropertyLoading(true);
      setPropertyLookupError(null);

      fetch(`/api/lookup/property/${encodeURIComponent(debouncedPropertyNo)}`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`मालमत्ता क्रमांक किंवा करदाता '${debouncedPropertyNo}' आढळला नाही.`);
          }
          return res.json();
        })
        .then((json) => {
          if (json.data) {
            propertyCacheRef.current.set(cacheKey, json.data);
            setPropertyData(json.data);
            setIsPropertyLoading(false);
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setPropertyLookupError(err.message);
            setIsPropertyLoading(false);
          }
        });

      return () => {
        controller.abort();
      };
    }
  }, [debouncedPropertyNo, sheetData.slug]);

  // Filter rows using the Unicode / Devanagari normalized search engine
  const filteredRows = useMemo(() => {
    return searchRows(rowsState, debouncedSearch);
  }, [rowsState, debouncedSearch]);

  // Paginated rows
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / (pageSize === -1 ? filteredRows.length || 1 : pageSize)));
  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return filteredRows;
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Intelligent column header detection
  const colHeaders = useMemo(() => {
    const maxCols = Math.min(sheetData.max_col, 40);
    // Find candidate header row with maximum text cells (check rows 1, 4, 6, 7, 8)
    const candidateRows = rowsState.filter((r) => [1, 4, 6, 7, 8].includes(r.row_index));
    let bestRow = rowsState[0];
    let maxNonEmpty = 0;

    for (const r of candidateRows) {
      const nonEmptyTextCount = r.cells.filter(
        (c) => c.value && typeof c.value === "string" && c.value.trim().length > 1
      ).length;
      if (nonEmptyTextCount > maxNonEmpty) {
        maxNonEmpty = nonEmptyTextCount;
        bestRow = r;
      }
    }

    const headers: { col: number; label: string }[] = [];
    for (let c = 1; c <= maxCols; c++) {
      const cell = bestRow?.cells.find((ce) => ce.col === c);
      let label = cell?.value ? String(cell.value).replace(/\n/g, " ").trim() : "";
      if (!label || label.length > 35) {
        label = `स्तंभ ${c}`;
      }
      headers.push({ col: c, label });
    }
    return headers;
  }, [rowsState, sheetData.max_col]);

  const handlePrint = () => {
    setPrintTimestamp(getKolkataPrintTimestamp());
    setTimeout(() => {
      window.print();
    }, 50);
  };

  // Persistent Delete
  const handleDelete = async (rowIndex: number) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/sheets/${sheetData.slug}?rowIndex=${rowIndex}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "हटवणे अयशस्वी.");
      }
      setRowsState((prev) => prev.filter((r) => r.row_index !== rowIndex));
      setDeleteConfirmRowIndex(null);
      showNotification("नोंद कायमस्वरूपी हटवली आहे (Record deleted permanently).");
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Persistent Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/sheets/${sheetData.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row: editingRow }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "बदल सेव्ह करता आले नाहीत.");
      }
      setRowsState((prev) =>
        prev.map((r) => (r.row_index === editingRow.row_index ? data.updated_row : r))
      );
      setEditingRow(null);
      showNotification("बदल यशस्वीरित्या डेटाबेसमध्ये जतन केले (Saved permanently).");
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Persistent Add Record
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cells = Object.entries(newRowValues).map(([colStr, val]) => ({
      col: parseInt(colStr, 10),
      value: val,
    }));

    if (cells.length === 0) {
      showNotification("कृपया किमान एका रकान्यात माहिती भरा.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/sheets/${sheetData.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cells }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "नवीन नोंद जोडणे अयशस्वी.");
      }
      setRowsState((prev) => [...prev, data.row]);
      setIsAddModalOpen(false);
      setNewRowValues({});
      showNotification("नवीन नोंद यशस्वीरित्या जोडली (New record added permanently).");
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Real WhatsApp Dispatch
  const handleWhatsAppDispatch = async (memberSr?: number) => {
    setWhatsappLoading(true);
    setWhatsappResult(null);
    try {
      const res = await fetch("/api/notice/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberSr }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "WhatsApp पाठवणे अयशस्वी.");
      }
      setWhatsappResult(json);
      showNotification(
        memberSr
          ? "सदस्यास WhatsApp नोटीस पाठवली आहे."
          : `सर्व ${json.total_targeted} सदस्यांसाठी WhatsApp डिस्पॅच प्रक्रिया पूर्ण.`
      );
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setWhatsappLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs flex items-center gap-2 animate-in fade-in ${
            notification.type === "success"
              ? "bg-[#245C45] text-white"
              : "bg-rose-700 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-200" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header of Sheet */}
      <div className="bg-white border border-[#E6EAE5] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-[#EAF1EC] text-[#245C45] font-semibold px-2 py-0.5 rounded border border-[#245C45]/15">
              वर्कशीट #{sheetData.index} • {sheetData.category}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#202923] mt-1 flex items-center gap-2">
            <span>{sheetData.name}</span>
          </h2>
          <p className="text-xs text-[#68736C] mt-0.5">
            एकूण नोंदवही: <strong>{rowsState.length}</strong> ओळी •{" "}
            <strong>{sheetData.max_col}</strong> कॉलम्स
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isDocumentSheet && (
            <div className="flex rounded-lg bg-[#F7F8F5] p-1 border border-[#E6EAE5] text-xs">
              <button
                onClick={() => setActiveTab("document")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === "document"
                    ? "bg-white text-[#245C45] font-semibold shadow-2xs"
                    : "text-[#68736C] hover:text-[#202923]"
                }`}
              >
                दस्तावेज / प्रिंट फॉरमॅट
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === "table"
                    ? "bg-white text-[#245C45] font-semibold shadow-2xs"
                    : "text-[#68736C] hover:text-[#202923]"
                }`}
              >
                स्प्रेडशीट तक्ता दृश्य
              </button>
            </div>
          )}

          {isDocumentSheet && activeTab === "document" && (
            <button
              onClick={() => setIsPrintPreview(!isPrintPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-colors ${
                isPrintPreview
                  ? "bg-[#245C45] text-white border-[#245C45]"
                  : "bg-white border-[#E6EAE5] hover:bg-[#F7F8F5] text-[#202923]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPrintPreview ? "सामान्य दृश्य" : "प्रिंट पूर्वदृश्य (A4 Preview)"}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#245C45] text-white hover:bg-[#1D4B38] text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>प्रिंट / PDF (A4)</span>
          </button>

          <button
            onClick={() => {
              setNewRowValues({});
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#245C45] text-white hover:bg-[#1D4B38] text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नवीन नोंद जोडा</span>
          </button>
        </div>
      </div>

      {/* SPECIAL VIEW: DOCUMENT GENERATION TAB */}
      {activeTab === "document" && (
        <div className="bg-white border border-[#E1E5E1] rounded-lg p-6 shadow-xs printable-card">
          {/* 1. UTARA DOCUMENT (नमुना ६/८ उतारा) */}
          {sheetData.slug === "utara" && (
            <div className="space-y-4">
              <style jsx global>{`
                @media print {
                  @page {
                    size: A4 landscape !important;
                    margin: 5mm 6mm !important;
                  }
                }
              `}</style>

              <PropertySearchBox
                selectedPropertyNo={selectedPropertyNo}
                onSelectProperty={(propNo) => setSelectedPropertyNo(propNo)}
                isLoading={isPropertyLoading || isPropertyDebouncing}
                error={propertyLookupError}
                placeholder="उदा. 7A, 15A, 6B, 1, किंवा करदात्याचे नाव..."
                label="🔍 मिळकत क्र. किंवा करदाता शोधा :"
              />

              {propertyData ? (
                <div
                  className={`w-full transition-all ${
                    isPrintPreview
                      ? "max-w-[297mm] mx-auto p-4 bg-white shadow-2xl border border-neutral-300 rounded"
                      : ""
                  }`}
                >
                  <UtaraDocument property={propertyData} printTimestamp={printTimestamp} />
                </div>
              ) : (
                <div className="text-center p-8 bg-neutral-50 rounded border border-neutral-200 text-xs text-neutral-500">
                  {isPropertyLoading
                    ? "माहिती लोड होत आहे..."
                    : "कृपया मिळकत क्रमांक किंवा करदात्याचे नाव निवडा."}
                </div>
              )}
            </div>
          )}

          {/* 2. MAGANI BILL */}
          {sheetData.slug === "magani-bill" && (
            <div className="space-y-4">
              <style jsx global>{`
                @media print {
                  @page {
                    size: A4 portrait !important;
                    margin: 8mm 10mm !important;
                  }
                }
              `}</style>

              <PropertySearchBox
                selectedPropertyNo={selectedPropertyNo}
                onSelectProperty={(propNo) => setSelectedPropertyNo(propNo)}
                isLoading={isPropertyLoading || isPropertyDebouncing}
                error={propertyLookupError}
                placeholder="उदा. 7A, 15A, 6B, 1, किंवा करदात्याचे नाव..."
                label="🔍 मिळकत क्र. किंवा करदाता शोधा :"
              />

              {propertyData ? (
                <div
                  className={`w-full transition-all ${
                    isPrintPreview
                      ? "max-w-[210mm] mx-auto p-4 bg-white shadow-2xl border border-neutral-300 rounded"
                      : ""
                  }`}
                >
                  <MaganiBillDocument property={propertyData} printTimestamp={printTimestamp} />
                </div>
              ) : (
                <div className="text-center p-8 bg-neutral-50 rounded border border-neutral-200 text-xs text-neutral-500">
                  {isPropertyLoading
                    ? "माहिती लोड होत आहे..."
                    : "कृपया मिळकत क्रमांक किंवा करदात्याचे नाव निवडा."}
                </div>
              )}
            </div>
          )}

          {/* 3. NAMUNA 10 PAVATI */}
          {sheetData.slug === "namuna-10-pavati" && (
            <div className="space-y-4">
              <style jsx global>{`
                @media print {
                  @page {
                    size: A4 portrait !important;
                    margin: 6mm 8mm !important;
                  }
                }
              `}</style>

              {/* Interactive Controls Bar */}
              <div className="no-print space-y-3 bg-[#F6F7F5] p-4 rounded-xl border border-[#E1E5E1]">
                <PropertySearchBox
                  selectedPropertyNo={selectedPropertyNo}
                  onSelectProperty={(propNo) => setSelectedPropertyNo(propNo)}
                  isLoading={isPropertyLoading || isPropertyDebouncing}
                  error={propertyLookupError}
                  placeholder="उदा. 7A, 15A, 6B, 1, किंवा करदात्याचे नाव..."
                  label="🔍 मिळकत क्र. किंवा करदाता शोधा :"
                />

                {/* Editable Receipt Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E1E5E1]">
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      पावती दिनांक :
                    </label>
                    <input
                      type="text"
                      value={n10ReceiptDate}
                      onChange={(e) => setN10ReceiptDate(e.target.value)}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#245C45]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      पावती क्रमांक (ऐच्छिक) :
                    </label>
                    <input
                      type="text"
                      value={n10ReceiptNo}
                      onChange={(e) => setN10ReceiptNo(e.target.value)}
                      placeholder={`उदा. पा-${selectedPropertyNo}`}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#245C45]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      भरणा प्रकार :
                    </label>
                    <select
                      value={n10PaymentMode}
                      onChange={(e) => setN10PaymentMode(e.target.value)}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#245C45]"
                    >
                      <option value="रोख (Cash)">रोख (Cash)</option>
                      <option value="रोख (Cash) / ऑनलाइन">रोख (Cash) / ऑनलाइन</option>
                      <option value="ऑनलाइन (UPI / NetBanking)">ऑनलाइन (UPI / NetBanking)</option>
                      <option value="धनादेश (Cheque)">धनादेश (Cheque)</option>
                    </select>
                  </div>
                </div>
              </div>

              {propertyData ? (
                <div
                  className={`w-full transition-all ${
                    isPrintPreview
                      ? "max-w-[210mm] mx-auto p-4 bg-white shadow-2xl border border-neutral-300 rounded"
                      : ""
                  }`}
                >
                  <Namuna10Document
                    property={propertyData}
                    receiptNo={n10ReceiptNo}
                    receiptDate={n10ReceiptDate}
                    paymentMode={n10PaymentMode}
                    printTimestamp={printTimestamp}
                  />
                </div>
              ) : (
                <div className="text-center p-8 bg-neutral-50 rounded border border-neutral-200 text-xs text-neutral-500">
                  {isPropertyLoading
                    ? "माहिती लोड होत आहे..."
                    : "कृपया मिळकत क्रमांक किंवा करदात्याचे नाव निवडा."}
                </div>
              )}
            </div>
          )}

          {/* 4. NAMUNA 7 PAVATI (General Receipt) */}
          {sheetData.slug === "namuna-7-pavati" && (
            <div className="space-y-4">
              <style jsx global>{`
                @media print {
                  @page {
                    size: A4 portrait !important;
                    margin: 6mm 8mm !important;
                  }
                }
              `}</style>

              <div className="no-print space-y-3 bg-[#F6F7F5] p-4 rounded-xl border border-[#E1E5E1]">
                <PropertySearchBox
                  selectedPropertyNo={selectedPropertyNo}
                  onSelectProperty={(propNo) => setSelectedPropertyNo(propNo)}
                  isLoading={isPropertyLoading || isPropertyDebouncing}
                  error={propertyLookupError}
                  placeholder="उदा. 7A, 15A, 6B, 1, किंवा करदात्याचे नाव निवडून ऑटोफिल करा..."
                  label="🔍 करदाता / मिळकत क्र. निवडून ऑटोफिल करा :"
                />

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E1E5E1]">
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      पुस्तक क्र. (Book No.) :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.bookNo}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, bookNo: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      पावती क्र. (Receipt No.) :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.receiptNo}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, receiptNo: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      पावती दिनांक :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.date}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, date: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      आर्थिक वर्ष :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.financialYear}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, financialYear: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      रक्कम देणाऱ्याचे नाव (Payer Name) :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.payerName}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, payerName: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      पत्ता (Address) :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.address}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, address: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      मोबाईल नंबर :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.mobileNo || ""}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, mobileNo: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      कोणत्या कारणास्तव रक्कम मिळाली (Reason) :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.reason}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, reason: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      जमेचे खाते (Account Head) :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.accountHead}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, accountHead: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      रक्कम (₹) :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.amount}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, amount: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      अक्षरी रक्कम :
                    </label>
                    <input
                      type="text"
                      value={namuna7Data.amountWords}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, amountWords: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#747C76] block mb-1">
                      भरणा प्रकार :
                    </label>
                    <select
                      value={namuna7Data.paymentMode}
                      onChange={(e) => setNamuna7Data({ ...namuna7Data, paymentMode: e.target.value })}
                      className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs"
                    >
                      <option value="रोख (Cash)">रोख (Cash)</option>
                      <option value="ऑनलाइन (UPI / NetBanking)">ऑनलाइन (UPI / NetBanking)</option>
                      <option value="धनादेश (Cheque)">धनादेश (Cheque)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Printable Namuna 7 Document */}
              <div
                className={`w-full transition-all ${
                  isPrintPreview
                    ? "max-w-[210mm] mx-auto p-4 bg-white shadow-2xl border border-neutral-300 rounded"
                    : ""
                }`}
              >
                <Namuna7Document data={namuna7Data} printTimestamp={printTimestamp} />
              </div>
            </div>
          )}

          {/* 5. MASIK SABHA NOTICE & WHATSAPP HUB */}
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
                  onClick={() => handleWhatsAppDispatch()}
                  disabled={whatsappLoading}
                  className="px-3.5 py-2 bg-[#245C45] text-white rounded text-xs font-medium hover:bg-[#1b4534] shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-75"
                >
                  <Send className={`w-3.5 h-3.5 ${whatsappLoading ? "animate-spin" : ""}`} />
                  <span>{whatsappLoading ? "पाठवत आहे..." : "सर्व सदस्यांना नोटीस पाठवा (Bulk WhatsApp)"}</span>
                </button>
              </div>

              {whatsappResult && (
                <div className="no-print bg-[#E8F5E9] text-[#2E7D32] p-3 rounded text-xs font-medium border border-[#A5D6A7] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>WhatsApp डिस्पॅच अहवाल ({whatsappResult.total_targeted} सदस्य लक्ष्यित)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 pt-1 text-[11px]">
                    {whatsappResult.dispatched?.map((d: any) => (
                      <div key={d.sr} className="p-1 rounded bg-white border border-[#cbe0d3]">
                        <span className="font-semibold">{d.sr}. {d.name}</span>:{" "}
                        <span className={d.status === "SENT" ? "text-emerald-700 font-bold" : "text-amber-700"}>
                          {d.status === "SENT" ? "पाठवले" : "मोबाईल प्रलंबित"}
                        </span>
                      </div>
                    ))}
                  </div>
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
                      {[
                        { sr: 1, sub: "मागील सभेचे इतिवृत्त वाचन", det: "दि. १५/१०/२०२६ च्या सभेचे इतिवृत्त (प्रोसिडिंग) वाचून कायम करणे.", rem: "नियमित" },
                        { sr: 2, sub: "मागील माहे जमा-खर्च मंजुरी", det: "माहे ऑक्टोबर २०२६ मधील ग्रामनिधी व इतर योजना जमा-खर्च आढावा घेणे.", rem: "मंजुरीसाठी" },
                        { sr: 3, sub: "कर वसुली आढावा व मोहीम", det: "नमुना ८ नुसार घरपट्टी, पाणीपट्टी कर वसुली १००% करण्यासाठी मोहीम आखणे.", rem: "वसुली मोहीम" },
                        { sr: 4, sub: "स्वच्छता व दिवाबत्ती दुरुस्ती", det: "गावातील अंतर्गत रस्ते, नाले स्वच्छता व नादुरुस्त पथदिवे दुरुस्ती करणे.", rem: "जनसुविधा" },
                        { sr: 5, sub: "विकासकामे व १५ वा वित्त आयोग", det: "वार्षिक आराखड्यातील मंजूर विकासकामांना प्रशासकीय मंजुरी देणे.", rem: "विकासकामे" },
                        { sr: 6, sub: "नागरिकांचे अर्ज व दाखले", det: "नागरिकांचे नमुना ८ नोंद, नाव दुरुस्ती, पाणीपट्टी व बांधकाम परवानग्या.", rem: "प्रशासकीय" },
                        { sr: 7, sub: "अध्यक्षांच्या परवानगीने ऐनवेळचे विषय", det: "सभेच्या दिवशी ऐनवेळी येणाऱ्या तातडीच्या व सार्वजनिक विषयांवर चर्चा करणे.", rem: "ऐनवेळचे" },
                      ].map((a) => (
                        <tr key={a.sr}>
                          <td className="p-1.5 text-center border-r border-[#252A27]">{a.sr}</td>
                          <td className="p-1.5 border-r border-[#252A27] font-semibold">{a.sub}</td>
                          <td className="p-1.5 border-r border-[#252A27]">{a.det}</td>
                          <td className="p-1.5 text-center">{a.rem}</td>
                        </tr>
                      ))}
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
                        <th className="p-1.5 text-center w-16 no-print">WhatsApp</th>
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
                          <td className="p-1.5 text-center no-print">
                            <button
                              onClick={() => handleWhatsAppDispatch(m.sr)}
                              className="px-2 py-0.5 rounded bg-[#EAF1EC] text-[#245C45] hover:bg-[#245C45] hover:text-white transition-colors text-[11px] font-semibold flex items-center justify-center gap-1 mx-auto"
                              title="या सदस्यास पाठवा"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>पाठवा</span>
                            </button>
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
        <div className="bg-white border border-[#E6EAE5] rounded-xl overflow-hidden shadow-xs">
          {/* Controls Bar: Search & Pagination Selector */}
          <div className="p-3.5 border-b border-[#E6EAE5] bg-[#F7F8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#68736C]" />
                <input
                  type="text"
                  placeholder="नोंद, नाव, मिळकत क्र. (उदा. 7A, 15A, 6B) किंवा मूल्य शोधा..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-[#E6EAE5] rounded-lg text-[#202923] placeholder-[#9DA39F] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20 transition-all"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-2.5 top-2 text-[#68736C] hover:text-[#202923] transition-colors"
                    title="शोध क्लिअर करा"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {isSearching && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#245C45] shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#68736C]">
              {debouncedSearch.trim() && (
                <span className="font-semibold text-[#245C45] bg-[#EAF1EC] px-2.5 py-1 rounded-md text-[11px] border border-[#245C45]/15">
                  {filteredRows.length} नोंदी सापडल्या
                </span>
              )}
              <span>दर्शवा:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#E6EAE5] rounded-md px-2.5 py-1 text-xs text-[#202923] focus:outline-none focus:border-[#245C45]"
              >
                <option value={25}>२५ नोंदी</option>
                <option value={50}>५० नोंदी</option>
                <option value={100}>१०० नोंदी</option>
                <option value={-1}>सर्व नोंदी</option>
              </select>
              <span className="text-[11px] text-[#9DA39F]">(एकूण: {rowsState.length})</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F8F5] sticky top-0 z-10 border-b border-[#E6EAE5] text-[#202923] font-semibold">
                <tr>
                  <th className="py-2.5 px-3 border-r border-[#E6EAE5] w-14 text-center">
                    ओळ
                  </th>
                  {colHeaders.map((col) => (
                    <th
                      key={col.col}
                      className="py-2.5 px-3 border-r border-[#E6EAE5] whitespace-nowrap min-w-[120px]"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-center w-20 sticky right-0 bg-[#F7F8F5] border-l border-[#E6EAE5]">
                    कृती
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAE5]">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={colHeaders.length + 2}
                      className="py-12 text-center text-[#68736C]"
                    >
                      <div className="space-y-2">
                        <p className="font-medium text-sm text-[#202923]">
                          {debouncedSearch
                            ? `"${debouncedSearch}" साठी कोणतीही नोंद सापडली नाही.`
                            : "कोणतीही नोंद सापडली नाही."}
                        </p>
                        {debouncedSearch && (
                          <button
                            onClick={() => setSearchInput("")}
                            className="px-3.5 py-1.5 bg-[#EAF1EC] text-[#245C45] rounded-md text-xs font-semibold hover:bg-[#d8e7dc] transition-colors"
                          >
                            शोध क्लिअर करा आणि सर्व नोंदी पहा
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.row_index}
                      className="hover:bg-[#F7F8F5] transition-colors group"
                    >
                      <td className="py-2 px-3 border-r border-[#E6EAE5] text-center font-mono text-[11px] text-[#68736C] bg-white group-hover:bg-[#F7F8F5]">
                        {row.row_index}
                      </td>
                      {colHeaders.map((col) => {
                        const cell = row.cells.find((c) => c.col === col.col);
                        const val = cell?.value;
                        const hasFormula = cell?.is_formula;
                        return (
                          <td
                            key={col.col}
                            className="py-2 px-3 border-r border-[#E6EAE5] whitespace-nowrap font-sans text-[12px] text-[#202923]"
                            title={
                              hasFormula
                                ? `सूत्र: ${cell.formula}`
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
                      <td className="py-2 px-3 text-center sticky right-0 bg-white group-hover:bg-[#F7F8F5] border-l border-[#E6EAE5]">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingRow(row)}
                            className="p-1 text-[#68736C] hover:text-[#245C45] hover:bg-[#EAF1EC] rounded transition-colors"
                            title="संपादित करा"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmRowIndex(row.row_index)}
                            className="p-1 text-[#68736C] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
            <div className="p-3.5 border-t border-[#E6EAE5] bg-white flex items-center justify-between text-xs text-[#68736C]">
              <span>
                पान <strong className="text-[#202923]">{currentPage}</strong> पैकी{" "}
                <strong className="text-[#202923]">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md border border-[#E6EAE5] hover:bg-[#F7F8F5] text-[#202923] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md border border-[#E6EAE5] hover:bg-[#F7F8F5] text-[#202923] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPLETE EDIT ROW MODAL (All Columns Supported) */}
      {editingRow && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#E6EAE5] max-w-3xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6EAE5] pb-3.5">
              <h3 className="text-sm font-bold text-[#202923]">
                नोंद संपादित करा (ओळ #{editingRow.row_index} • {sheetData.name})
              </h3>
              <button
                onClick={() => setEditingRow(null)}
                className="p-1 rounded-md text-[#68736C] hover:bg-[#F7F8F5] hover:text-[#202923] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto space-y-3.5 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {colHeaders.map((col) => {
                  const cell = editingRow.cells.find((c) => c.col === col.col);
                  return (
                    <div key={col.col} className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#68736C] block truncate" title={col.label}>
                        {col.label} {cell?.is_formula && "(=सूत्र)"}
                      </label>
                      <input
                        type="text"
                        value={cell?.value !== null && cell?.value !== undefined ? String(cell.value) : ""}
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
                        className="w-full px-3 py-1.5 border border-[#E6EAE5] rounded-lg text-xs text-[#202923] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#E6EAE5] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E6EAE5] text-xs font-semibold text-[#68736C] hover:bg-[#F7F8F5] transition-colors"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-[#245C45] text-white text-xs font-semibold hover:bg-[#1D4B38] disabled:opacity-75 flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>बदल जतन करा (Save)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORKING ADD RECORD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#E6EAE5] max-w-3xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6EAE5] pb-3.5">
              <h3 className="text-sm font-bold text-[#202923]">
                नवीन नोंद जोडा ({sheetData.name})
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-[#68736C] hover:bg-[#F7F8F5] hover:text-[#202923] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="flex-1 overflow-y-auto space-y-3.5 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {colHeaders.map((col) => (
                  <div key={col.col} className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#68736C] block truncate" title={col.label}>
                      {col.label}
                    </label>
                    <input
                      type="text"
                      placeholder={`${col.label} प्रविष्ट करा...`}
                      value={newRowValues[col.col] || ""}
                      onChange={(e) =>
                        setNewRowValues({ ...newRowValues, [col.col]: e.target.value })
                      }
                      className="w-full px-3 py-1.5 border border-[#E6EAE5] rounded-lg text-xs text-[#202923] placeholder-[#9DA39F] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#E6EAE5] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E6EAE5] text-xs font-semibold text-[#68736C] hover:bg-[#F7F8F5] transition-colors"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-[#245C45] text-white text-xs font-semibold hover:bg-[#1D4B38] disabled:opacity-75 flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>नोंद जतन करा (Add Record)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmRowIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#E6EAE5] max-w-sm w-full p-5 space-y-3.5 shadow-2xl">
            <h3 className="text-sm font-bold text-[#202923]">नोंद हटवण्याची पुष्टी करा</h3>
            <p className="text-xs text-[#68736C] leading-relaxed">
              तुम्हाला ओळ <strong>#{deleteConfirmRowIndex}</strong> कायमस्वरूपी हटवायची आहे का?
              हा बदल डेटाबेसमध्ये जतन होईल.
            </p>
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmRowIndex(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#E6EAE5] text-xs font-semibold text-[#68736C] hover:bg-[#F7F8F5] transition-colors"
              >
                रद्द करा
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmRowIndex)}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-75 flex items-center gap-1 shadow-xs transition-colors"
              >
                {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>होय, हटवा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
