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

  // Namuna 10 Pavati Specific State
  const [n10ReceiptDate, setN10ReceiptDate] = useState<string>("10/11/2026 09:04 AM");
  const [n10ReceiptNo, setN10ReceiptNo] = useState<string>("");
  const [n10PaymentMode, setN10PaymentMode] = useState<string>("रोख (Cash) / ऑनलाइन");
  const [n10IsPrintPreview, setN10IsPrintPreview] = useState<boolean>(false);

  useEffect(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, "0");
    setN10ReceiptDate(`${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`);
  }, []);

  // Namuna 7 Specific State
  const [namuna7Data, setNamuna7Data] = useState({
    receiptNo: "पा-०२६",
    date: "१०/११/२०२६",
    payerName: "श्री. प्रल्हाद गोविंदा हाडे",
    feeType: "दाखले फी (जन्म/मृत्यू/रहिवासी)",
    amount: "१००",
    amountWords: "रुपये एकशे /- फक्त",
    paymentMode: "रोख (Cash)",
  });

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
    if (["utara", "magani-bill", "namuna-10-pavati"].includes(sheetData.slug) && debouncedPropertyNo) {
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
    window.print();
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

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E6EAE5] hover:bg-[#F7F8F5] text-xs font-semibold text-[#202923] shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#245C45]" />
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
          {/* 1. UTARA DOCUMENT */}
          {sheetData.slug === "utara" && (
            <div className="space-y-6">
              {/* Selector / Search Property Input */}
              <div className="no-print bg-[#F6F7F5] p-3.5 rounded-lg border border-[#E1E5E1] space-y-2.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold text-[#252A27]">
                    🔍 मालमत्ता क्र. किंवा नाव :
                  </span>
                  <input
                    type="text"
                    value={selectedPropertyNo}
                    onChange={(e) => setSelectedPropertyNo(e.target.value)}
                    placeholder="उदा. 1, 2, 5A, 6B, 7A, 15A"
                    className="bg-white border border-[#E1E5E1] rounded px-3 py-1.5 text-xs font-mono font-bold text-[#245C45] w-44 focus:outline-none focus:border-[#245C45]"
                  />
                  {isPropertyLoading && (
                    <span className="text-xs text-[#245C45] flex items-center gap-1 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> शोधत आहे...
                    </span>
                  )}
                  {propertyLookupError && (
                    <span className="text-xs text-rose-600 font-medium">
                      ⚠️ {propertyLookupError}
                    </span>
                  )}
                  <span className="text-xs text-[#747C76] ml-auto hidden sm:block">
                    (नमुना ८ मधील कोणत्याही मिळकतीचा खरा डेटा लगेच भरला जातो)
                  </span>
                </div>

                {/* Quick Taxpayer Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-[#E1E5E1]">
                  <span className="text-[11px] font-semibold text-[#747C76] mr-1">त्वरित निवडा:</span>
                  {[
                    { no: "1", label: "१ (प्रल्हाद हाडे)" },
                    { no: "2", label: "२ (अशोक काठोळे)" },
                    { no: "3", label: "३ (सुदाम हाडे)" },
                    { no: "4", label: "४ (सौ रेखा हाडे)" },
                    { no: "5A", label: "५A (सुभाष हाडे)" },
                    { no: "6B", label: "६B (ऋषिकेश हाडे)" },
                    { no: "9", label: "९ (मुरलीधर हाडे)" },
                  ].map((item) => (
                    <button
                      key={item.no}
                      type="button"
                      onClick={() => setSelectedPropertyNo(item.no)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                        selectedPropertyNo === item.no
                          ? "bg-[#245C45] text-white border-[#245C45]"
                          : "bg-white text-[#252A27] border-[#E1E5E1] hover:bg-[#EAF1EC]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
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
                          {propertyData?.property_no || selectedPropertyNo}
                        </td>
                        <td className="p-2 font-semibold border-r border-[#252A27] w-1/4 bg-[#F6F7F5]">
                          सिटी सर्व्हे नंबर
                        </td>
                        <td className="p-2 w-1/4 font-mono">{propertyData?.city_survey_no || "-"}</td>
                      </tr>
                      <tr className="border-b border-[#252A27]">
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          मालकाचे नाव
                        </td>
                        <td className="p-2 font-bold border-r border-[#252A27]" colSpan={3}>
                          {propertyData?.owner_name || "शोधत आहे..."}
                        </td>
                      </tr>
                      <tr className="border-b border-[#252A27]">
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          मालमत्तेचे वर्णन
                        </td>
                        <td className="p-2 border-r border-[#252A27]">
                          {propertyData?.property_description || "नवीन आर सी सी पद्धतीचे घर"}
                        </td>
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          बांधकामाचे वर्ष
                        </td>
                        <td className="p-2">{propertyData?.construction_year_bracket || "२ पेक्षा जास्त व ५ वर्ष पर्यंत"}</td>
                      </tr>
                      <tr className="border-b border-[#252A27]">
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          क्षेत्रफळ (लांबी × रुंदी)
                        </td>
                        <td className="p-2 border-r border-[#252A27]">
                          {propertyData?.length_ft || 0} × {propertyData?.width_ft || 0} = {propertyData?.area_sq_ft || 0} चौ.फूट
                        </td>
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          क्षेत्रफळ चौ.मी.
                        </td>
                        <td className="p-2 font-mono">{propertyData?.area_sq_m || 0} चौ.मी.</td>
                      </tr>
                      <tr className="border-b border-[#252A27]">
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          भांडवली मूल्य (रुपये)
                        </td>
                        <td className="p-2 font-bold font-mono border-r border-[#252A27]">
                          ₹{propertyData?.capital_value ? Math.round(propertyData.capital_value).toLocaleString("en-IN") : "0"}/-
                        </td>
                        <td className="p-2 font-semibold border-r border-[#252A27] bg-[#F6F7F5]">
                          कराचा दर
                        </td>
                        <td className="p-2 font-mono">{propertyData?.tax_rate_paise || 1.2} पैसे</td>
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
                        <td className="p-2 border-r border-[#252A27]">₹{propertyData?.house_tax_current || 0}/-</td>
                        <td className="p-2 border-r border-[#252A27]">₹{propertyData?.light_tax_current || 30}/-</td>
                        <td className="p-2 border-r border-[#252A27]">₹{propertyData?.health_tax_current || 30}/-</td>
                        <td className="p-2 border-r border-[#252A27]">₹{propertyData?.water_tax_current || 0}/-</td>
                        <td className="p-2 font-bold text-[#245C45]">₹{propertyData?.grand_total || 0}/-</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Boundaries */}
                  <div className="grid grid-cols-4 gap-2 border border-[#252A27] p-2 mt-3 text-center">
                    <div>
                      <span className="font-semibold block">पूर्व :</span> {propertyData?.east || "शेतजमीन"}
                    </div>
                    <div>
                      <span className="font-semibold block">पश्चिम :</span> {propertyData?.west || "ग्राम रस्ता"}
                    </div>
                    <div>
                      <span className="font-semibold block">उत्तर :</span> {propertyData?.north || "शेजारील मिळकत"}
                    </div>
                    <div>
                      <span className="font-semibold block">दक्षिण :</span> {propertyData?.south || "मोकळी जागा"}
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

          {/* 2. MAGANI BILL */}
          {sheetData.slug === "magani-bill" && (
            <div className="space-y-6">
              <div className="no-print bg-[#F6F7F5] p-3.5 rounded-lg border border-[#E1E5E1] space-y-2.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold text-[#252A27]">
                    🔍 मिळकत क्र. किंवा नाव :
                  </span>
                  <input
                    type="text"
                    value={selectedPropertyNo}
                    onChange={(e) => setSelectedPropertyNo(e.target.value)}
                    placeholder="उदा. 1, 2, 5A, 6B, 7A, 15A"
                    className="bg-white border border-[#E1E5E1] rounded px-3 py-1.5 text-xs font-mono font-bold text-[#245C45] w-44 focus:outline-none focus:border-[#245C45]"
                  />
                  {isPropertyLoading && (
                    <span className="text-xs text-[#245C45] flex items-center gap-1 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> शोधत आहे...
                    </span>
                  )}
                  {propertyLookupError && (
                    <span className="text-xs text-rose-600 font-medium">
                      ⚠️ {propertyLookupError}
                    </span>
                  )}
                  <span className="text-xs text-[#747C76] ml-auto hidden sm:block">
                    (नमुना ९ कर मागणी नोंदवहीतून थेट बिल जनरेट होते)
                  </span>
                </div>

                {/* Quick Taxpayer Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-[#E1E5E1]">
                  <span className="text-[11px] font-semibold text-[#747C76] mr-1">त्वरित निवडा:</span>
                  {[
                    { no: "1", label: "१ (प्रल्हाद हाडे)" },
                    { no: "2", label: "२ (अशोक काठोळे)" },
                    { no: "3", label: "३ (सुदाम हाडे)" },
                    { no: "4", label: "४ (सौ रेखा हाडे)" },
                    { no: "5A", label: "५A (सुभाष हाडे)" },
                    { no: "6B", label: "६B (ऋषिकेश हाडे)" },
                    { no: "9", label: "९ (मुरलीधर हाडे)" },
                  ].map((item) => (
                    <button
                      key={item.no}
                      type="button"
                      onClick={() => setSelectedPropertyNo(item.no)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                        selectedPropertyNo === item.no
                          ? "bg-[#245C45] text-white border-[#245C45]"
                          : "bg-white text-[#252A27] border-[#E1E5E1] hover:bg-[#EAF1EC]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Printable Demand Bill */}
              <div className="border-2 border-[#252A27] p-6 space-y-4 bg-white text-[#252A27]">
                <div className="text-center border-b border-[#252A27] pb-3 space-y-1">
                  <h3 className="text-base font-bold">ग्रामपंचायत कार्यालय, गोहगाव</h3>
                  <p className="text-xs font-medium">वार्षिक कर मागणी बिल (सन २०२६ - २०२७)</p>
                  <p className="text-[11px] text-[#747C76]">तालुका : रिसोड, जिल्हा : वाशिम</p>
                </div>

                <div className="flex justify-between text-xs font-medium border-b border-[#E1E5E1] pb-2">
                  <div>
                    <p>
                      बिल क्रमांक : <strong>ब-{propertyData?.property_no || selectedPropertyNo}</strong>
                    </p>
                    <p className="mt-1">
                      करदात्याचे नाव : <strong>{propertyData?.owner_name || "शोधत आहे..."}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      बिल दिनांक : <strong>१०/११/२०२६</strong>
                    </p>
                    <p className="mt-1">
                      मिळकत क्रमांक : <strong>{propertyData?.property_no || selectedPropertyNo}</strong>
                    </p>
                  </div>
                </div>

                <table className="w-full border-collapse border border-[#252A27] text-xs">
                  <thead className="bg-[#F6F7F5] border-b border-[#252A27]">
                    <tr>
                      <th className="p-2 border-r border-[#252A27] w-12 text-center">अ.क्र.</th>
                      <th className="p-2 border-r border-[#252A27] text-left">कराचा तपशील / बाबी</th>
                      <th className="p-2 border-r border-[#252A27] text-right">मागील थकीत (₹)</th>
                      <th className="p-2 border-r border-[#252A27] text-right">चालू मागणी (₹)</th>
                      <th className="p-2 text-right">एकूण देय कर (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E1E5E1]">
                      <td className="p-2 text-center border-r border-[#252A27]">१</td>
                      <td className="p-2 border-r border-[#252A27]">इमारत व जमीन कर (घरकर)</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">
                        {propertyData?.house_tax_arrears || 0}
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">
                        {propertyData?.house_tax_current || 0}
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        {propertyData?.house_tax_total || 0}
                      </td>
                    </tr>
                    <tr className="border-b border-[#E1E5E1]">
                      <td className="p-2 text-center border-r border-[#252A27]">२</td>
                      <td className="p-2 border-r border-[#252A27]">दिवाबत्ती कर (दिवाकर)</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">
                        {propertyData?.light_tax_arrears || 0}
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">
                        {propertyData?.light_tax_current || 30}
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        {propertyData?.light_tax_total || 30}
                      </td>
                    </tr>
                    <tr className="border-b border-[#E1E5E1]">
                      <td className="p-2 text-center border-r border-[#252A27]">३</td>
                      <td className="p-2 border-r border-[#252A27]">सामान्य आरोग्य कर (सफाई कर)</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">
                        {propertyData?.health_tax_arrears || 0}
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">
                        {propertyData?.health_tax_current || 30}
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        {propertyData?.health_tax_total || 30}
                      </td>
                    </tr>
                    <tr className="border-b border-[#E1E5E1]">
                      <td className="p-2 text-center border-r border-[#252A27]">४</td>
                      <td className="p-2 border-r border-[#252A27]">सामान्य पाणीपट्टी कर</td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">
                        {propertyData?.water_tax_arrears || 0}
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">
                        {propertyData?.water_tax_current || 0}
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        {propertyData?.water_tax_total || 0}
                      </td>
                    </tr>
                    <tr className="bg-[#F6F7F5] font-bold border-b border-[#252A27]">
                      <td className="p-2 text-center border-r border-[#252A27]" colSpan={2}>
                        एकूण देय कर रक्कम
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">
                        ₹{((propertyData?.house_tax_arrears || 0) + (propertyData?.light_tax_arrears || 0) + (propertyData?.health_tax_arrears || 0) + (propertyData?.water_tax_arrears || 0))}
                      </td>
                      <td className="p-2 text-right border-r border-[#252A27] font-mono">
                        ₹{((propertyData?.house_tax_current || 0) + (propertyData?.light_tax_current || 0) + (propertyData?.health_tax_current || 0) + (propertyData?.water_tax_current || 0))}
                      </td>
                      <td className="p-2 text-right font-mono text-[#245C45] text-sm">
                        ₹{propertyData?.grand_total || 0}/-
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-xs bg-[#F6F7F5] p-2.5 rounded border border-[#E1E5E1]">
                  <strong>अक्षरी रक्कम :</strong> रुपये {propertyData?.grand_total || 0} /- फक्त
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

          {/* 3. NAMUNA 10 PAVATI */}
          {sheetData.slug === "namuna-10-pavati" && (() => {
            const effectiveReceiptNo = n10ReceiptNo.trim() || propertyData?.property_no || selectedPropertyNo || "1";
            const effectiveReceiptDate = n10ReceiptDate || "10/11/2026 09:04 AM";
            const taxpayerName = propertyData?.owner_name || (isPropertyLoading ? "माहिती शोधत आहे..." : "प्रल्हाद गोविंदा हाडे");
            const propNo = propertyData?.property_no || selectedPropertyNo || "1";

            const houseArrears = propertyData?.house_tax_arrears ?? 0;
            const houseCurrent = propertyData?.house_tax_current ?? 33;
            const houseTotal = propertyData?.house_tax_total ?? (houseArrears + houseCurrent);

            const lightArrears = propertyData?.light_tax_arrears ?? 0;
            const lightCurrent = propertyData?.light_tax_current ?? 30;
            const lightTotal = propertyData?.light_tax_total ?? (lightArrears + lightCurrent);

            const healthArrears = propertyData?.health_tax_arrears ?? 0;
            const healthCurrent = propertyData?.health_tax_current ?? 30;
            const healthTotal = propertyData?.health_tax_total ?? (healthArrears + healthCurrent);

            const waterArrears = propertyData?.water_tax_arrears ?? 0;
            const waterCurrent = propertyData?.water_tax_current ?? 0;
            const waterTotal = propertyData?.water_tax_total ?? (waterArrears + waterCurrent);

            const totalArrears = propertyData?.total_arrears ?? (houseArrears + lightArrears + healthArrears + waterArrears);
            const totalCurrent = propertyData?.total_current ?? (houseCurrent + lightCurrent + healthCurrent + waterCurrent);
            const grandTotal = propertyData?.grand_total ?? (houseTotal + lightTotal + healthTotal + waterTotal);

            const renderReceiptCopy = (copyType: "मूळ प्रत" | "कार्यालयीन प्रत (OC)") => (
              <div className="border-2 border-black p-3.5 space-y-2 bg-white text-black text-[11px] leading-tight select-text rounded-xs">
                {/* 1. Header */}
                <div className="text-center border-b border-black pb-2 space-y-0.5">
                  <h3 className="text-base font-bold tracking-wide">ग्रामपंचायत कार्यालय, गोहगाव</h3>
                  <p className="text-[11px] font-semibold text-neutral-900">
                    नमुना १० (नियम २२ (१२) पहा) - कर व फी वसुली पावती [ {copyType} ]
                  </p>
                  <p className="text-[10px] text-neutral-700">आर्थिक वर्ष : २०२६ - २०२७</p>
                </div>

                {/* 2. Metadata 2x2 Grid */}
                <div className="flex justify-between items-start text-[11px] border-b border-black pb-1.5 px-0.5">
                  <div className="space-y-0.5">
                    <p>
                      पावती क्रमांक : <strong className="font-mono">{effectiveReceiptNo}</strong>
                    </p>
                    <p>
                      करदात्याचे नाव : <strong>{taxpayerName}</strong>
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p>
                      पावती दिनांक : <strong>{effectiveReceiptDate}</strong>
                    </p>
                    <p>
                      मिळकत क्रमांक : <strong className="font-mono">{propNo}</strong>
                    </p>
                  </div>
                </div>

                {/* 3. Statutory 6-Column Tax Table */}
                <table className="w-full border-collapse border border-black text-[10.5px]">
                  <thead>
                    <tr className="bg-[#F6F7F5] border-b border-black font-bold">
                      <th className="p-1 border-r border-black w-10 text-center">अ.क्र.</th>
                      <th className="p-1 border-r border-black text-left">कराचा तपशील / बाबी</th>
                      <th className="p-1 border-r border-black text-right w-24">मागील थकीत (₹)</th>
                      <th className="p-1 border-r border-black text-right w-24">चालू मागणी (₹)</th>
                      <th className="p-1 border-r border-black text-right w-24">एकूण देय कर (₹)</th>
                      <th className="p-1 text-right w-24">वसूल रक्कम (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-1 text-center border-r border-black font-mono">1</td>
                      <td className="p-1 border-r border-black">इमारत व जमीन कर (घरकर)</td>
                      <td className="p-1 text-right border-r border-black font-mono">{houseArrears}</td>
                      <td className="p-1 text-right border-r border-black font-mono">{houseCurrent}</td>
                      <td className="p-1 text-right border-r border-black font-mono font-medium">{houseTotal}</td>
                      <td className="p-1 text-right font-mono font-bold">{houseTotal}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1 text-center border-r border-black font-mono">2</td>
                      <td className="p-1 border-r border-black">दिवाबत्ती कर (दिवाकर)</td>
                      <td className="p-1 text-right border-r border-black font-mono">{lightArrears}</td>
                      <td className="p-1 text-right border-r border-black font-mono">{lightCurrent}</td>
                      <td className="p-1 text-right border-r border-black font-mono font-medium">{lightTotal}</td>
                      <td className="p-1 text-right font-mono font-bold">{lightTotal}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1 text-center border-r border-black font-mono">3</td>
                      <td className="p-1 border-r border-black">सामान्य आरोग्य कर (सफाई कर)</td>
                      <td className="p-1 text-right border-r border-black font-mono">{healthArrears}</td>
                      <td className="p-1 text-right border-r border-black font-mono">{healthCurrent}</td>
                      <td className="p-1 text-right border-r border-black font-mono font-medium">{healthTotal}</td>
                      <td className="p-1 text-right font-mono font-bold">{healthTotal}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1 text-center border-r border-black font-mono">4</td>
                      <td className="p-1 border-r border-black">सामान्य पाणीपट्टी कर</td>
                      <td className="p-1 text-right border-r border-black font-mono">{waterArrears}</td>
                      <td className="p-1 text-right border-r border-black font-mono">{waterCurrent}</td>
                      <td className="p-1 text-right border-r border-black font-mono font-medium">{waterTotal}</td>
                      <td className="p-1 text-right font-mono font-bold">{waterTotal}</td>
                    </tr>
                    <tr className="bg-[#F6F7F5] font-bold border-t border-black">
                      <td className="p-1 text-center border-r border-black">एकूण</td>
                      <td className="p-1 border-r border-black">एकूण देय व वसूल कर रक्कम</td>
                      <td className="p-1 text-right border-r border-black font-mono">{totalArrears}</td>
                      <td className="p-1 text-right border-r border-black font-mono">{totalCurrent}</td>
                      <td className="p-1 text-right border-r border-black font-mono">{grandTotal}</td>
                      <td className="p-1 text-right font-mono text-emerald-800 print:text-black font-black text-xs">
                        {grandTotal}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 4. Post-Table Summary Lines */}
                <div className="flex justify-between items-center text-[10.5px] border-b border-black pb-1 px-0.5">
                  <div>
                    अक्षरी रक्कम : <strong>रुपये {grandTotal} /- फक्त (Rupees {grandTotal} Only)</strong>
                  </div>
                  <div>
                    भरणा प्रकार : <strong>{n10PaymentMode}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] border-b border-black pb-1 px-0.5">
                  <div>
                    शिल्लक बाकी : <strong className="font-mono">0</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>पावती स्थिती :</span>
                    <span className="font-bold text-emerald-800 print:text-black">
                      पूर्ण भरणा (PAID)
                    </span>
                  </div>
                </div>

                {/* 5. Statutory Terms & Instructions */}
                <div className="pt-0.5 space-y-0.5 text-[9px] text-neutral-800 print:text-black">
                  <p className="font-bold">महत्त्वाच्या सूचना व अटी :</p>
                  <p className="leading-tight">
                    १. ही पावती अधिकृत संगणकीकृत पावती असून ग्रामपंचायत गोहगावच्या मागणी नोंदवहीशी (नमुना ९) थेट संलग्न आहे.
                  </p>
                  <p className="leading-tight">
                    २. धनादेश / ऑनलाईन व्यवहाराच्या बाबतीत रक्कम ग्रामपंचायत बँक खात्यात जमा झाल्यावरच ही पावती वैध राहील.
                  </p>
                </div>

                {/* 6. Three Signature Blocks */}
                <div className="pt-3 pb-1 flex items-center justify-between text-[10px] font-semibold px-4 text-center">
                  <div>
                    <p>कर वसुली लिपिक</p>
                    <p className="text-[9px] text-neutral-600 print:text-black font-normal">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div>
                    <p>ग्रामसेवक / ग्रा.वि.अ.</p>
                    <p className="text-[9px] text-neutral-600 print:text-black font-normal">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div>
                    <p>सरपंच / उपसरपंच</p>
                    <p className="text-[9px] text-neutral-600 print:text-black font-normal">ग्रामपंचायत गोहगाव</p>
                  </div>
                </div>

                {/* 7. Footer */}
                <div className="border-t border-dotted border-neutral-400 pt-0.5 text-center text-[8.5px] text-neutral-500 print:text-black">
                  संगणकीकृत कर पावती - ग्रामपंचायत गोहगाव | स्वच्छ गाव, सुंदर गाव, समृद्ध गाव !
                </div>
              </div>
            );

            return (
              <div className="space-y-6">
                {/* Interactive Controls Bar (Hidden during printing) */}
                <div className="no-print space-y-3 bg-[#F6F7F5] p-4 rounded-xl border border-[#E1E5E1]">
                  {/* Row 1: Property input, lookup loader/error, Print Preview toggle & Print button */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#252A27]">
                        🔍 मिळकत क्र. किंवा करदाता नाव :
                      </span>
                      <input
                        type="text"
                        value={selectedPropertyNo}
                        onChange={(e) => setSelectedPropertyNo(e.target.value)}
                        placeholder="उदा. 1, 2, 5A, 6B..."
                        className="bg-white border border-[#E1E5E1] rounded px-3 py-1.5 text-xs font-mono font-bold text-[#245C45] w-36 focus:outline-none focus:border-[#245C45] shadow-xs"
                      />
                      {isPropertyLoading && (
                        <span className="text-xs text-[#245C45] flex items-center gap-1 font-medium">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> शोधत आहे...
                        </span>
                      )}
                      {propertyLookupError && (
                        <span className="text-xs text-red-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> {propertyLookupError}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setN10IsPrintPreview(!n10IsPrintPreview)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                          n10IsPrintPreview
                            ? "bg-[#245C45] text-white border-[#245C45]"
                            : "bg-white text-[#245C45] border-[#E1E5E1] hover:bg-[#EAF1EC]"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{n10IsPrintPreview ? "संवादी दृश्य (Interactive)" : "🖨️ A4 प्रिंट पूर्वावलोकन (Preview)"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#245C45] text-white hover:bg-[#1b4534] rounded text-xs font-bold shadow-xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>पावती प्रिंट करा (Print A4 PDF)</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Quick Taxpayer Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-semibold text-[#747C76] mr-1">त्वरित निवडा (Quick Select):</span>
                    {[
                      { no: "1", label: "१ (प्रल्हाद हाडे - ₹९३)" },
                      { no: "2", label: "२ (अशोक काठोळे - ₹४००)" },
                      { no: "3", label: "३ (सुदाम हाडे - ₹२८९)" },
                      { no: "4", label: "४ (सौ रेखा हाडे - ₹६४)" },
                      { no: "5A", label: "५A (सुभाष हाडे - ₹२२६)" },
                      { no: "6B", label: "६B (ऋषिकेश हाडे - ₹८७६)" },
                      { no: "9", label: "९ (मुरलीधर हाडे - ₹२१३)" },
                      { no: "10", label: "१० (सुदाम हाडे - ₹२२६)" },
                    ].map((item) => (
                      <button
                        key={item.no}
                        type="button"
                        onClick={() => setSelectedPropertyNo(item.no)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                          selectedPropertyNo === item.no
                            ? "bg-[#245C45] text-white border-[#245C45]"
                            : "bg-white text-[#252A27] border-[#E1E5E1] hover:bg-[#EAF1EC] hover:border-[#245C45]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Row 3: Editable Receipt Options */}
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
                        <option value="रोख (Cash) / ऑनलाइन">रोख (Cash) / ऑनलाइन</option>
                        <option value="रोख (Cash)">रोख (Cash)</option>
                        <option value="ऑनलाइन (UPI / NetBanking)">ऑनलाइन (UPI / NetBanking)</option>
                        <option value="धनादेश (Cheque)">धनादेश (Cheque)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Print Container: Dual-Receipt Layout on Single A4 Sheet */}
                <div
                  id="namuna-10-print-container"
                  className={`namuna-10-print-page w-full ${
                    n10IsPrintPreview
                      ? "max-w-[210mm] mx-auto bg-white p-4 sm:p-6 shadow-2xl border border-neutral-300 rounded-sm"
                      : ""
                  }`}
                >
                  {/* Top Copy: मूळ प्रत (Original Copy for citizen) */}
                  {renderReceiptCopy("मूळ प्रत")}

                  {/* Cut Divider: ✂️ - - - - - - - - - ✂️ */}
                  <div className="py-2.5 text-center text-[10px] text-neutral-500 font-mono tracking-widest flex items-center justify-center gap-2 select-none">
                    <span>✂️</span>
                    <span className="border-b border-dashed border-neutral-400 w-full" />
                    <span className="shrink-0 px-2 font-sans font-medium text-neutral-600 text-[10px]">
                      येथून कापा (Cut Here)
                    </span>
                    <span className="border-b border-dashed border-neutral-400 w-full" />
                    <span>✂️</span>
                  </div>

                  {/* Bottom Copy: कार्यालयीन प्रत (OC) (Office Copy for Panchayat) */}
                  {renderReceiptCopy("कार्यालयीन प्रत (OC)")}
                </div>
              </div>
            );
          })()}

          {/* 4. NAMUNA 7 PAVATI (General Receipt) */}
          {sheetData.slug === "namuna-7-pavati" && (
            <div className="space-y-6">
              <div className="no-print bg-[#F6F7F5] p-3 rounded-lg border border-[#E1E5E1] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#747C76] block">पावती क्र.</label>
                  <input
                    type="text"
                    value={namuna7Data.receiptNo}
                    onChange={(e) => setNamuna7Data({ ...namuna7Data, receiptNo: e.target.value })}
                    className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747C76] block">रक्कम देणारा (करदाता)</label>
                  <input
                    type="text"
                    value={namuna7Data.payerName}
                    onChange={(e) => setNamuna7Data({ ...namuna7Data, payerName: e.target.value })}
                    className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#747C76] block">रक्कम (₹)</label>
                  <input
                    type="text"
                    value={namuna7Data.amount}
                    onChange={(e) => setNamuna7Data({ ...namuna7Data, amount: e.target.value })}
                    className="w-full bg-white border border-[#E1E5E1] rounded px-2.5 py-1 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Printable Namuna 7 Receipt */}
              <div className="border-2 border-[#252A27] p-6 space-y-4 bg-white text-[#252A27]">
                <div className="text-center border-b border-[#252A27] pb-3 space-y-1">
                  <h3 className="text-base font-bold">ग्रामपंचायत कार्यालय, गोहगाव</h3>
                  <p className="text-xs font-semibold">नमुना ७ — किरकोळ वसुली / फी पावती</p>
                  <p className="text-[11px] text-[#747C76]">तालुका : रिसोड, जिल्हा : वाशिम • सन २०२६ - २०२७</p>
                </div>

                <div className="flex justify-between text-xs font-medium border-b border-[#E1E5E1] pb-2">
                  <p>पावती क्रमांक : <strong>{namuna7Data.receiptNo}</strong></p>
                  <p>पावती दिनांक : <strong>{namuna7Data.date}</strong></p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed py-2">
                  <p>
                    <strong>श्री / श्रीमती :</strong> {namuna7Data.payerName} यांजकडून खालील बाबीपोटी रक्कम मिळाली:
                  </p>
                  <table className="w-full border border-[#252A27] text-left">
                    <thead className="bg-[#F6F7F5] border-b border-[#252A27]">
                      <tr>
                        <th className="p-2 border-r border-[#252A27]">जमेचा तपशील / बाबी</th>
                        <th className="p-2 text-right w-32">रक्कम (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-r border-[#252A27]">{namuna7Data.feeType}</td>
                        <td className="p-2 text-right font-mono font-bold">₹{namuna7Data.amount}/-</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="bg-[#F6F7F5] p-2.5 rounded border border-[#E1E5E1]">
                    <strong>अक्षरी :</strong> {namuna7Data.amountWords}
                  </p>
                </div>

                <div className="pt-10 flex items-center justify-between text-xs font-semibold px-4">
                  <div className="text-center">
                    <p>वसूल करणारा कर्मचारी</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                  <div className="text-center">
                    <p>ग्रामसेवक / ग्रा.वि.अ.</p>
                    <p className="text-[10px] text-[#747C76]">ग्रामपंचायत गोहगाव</p>
                  </div>
                </div>
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
