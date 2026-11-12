"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  Calendar,
  Phone,
  MessageSquare,
  Database,
  Download,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export default function SettingsPage() {
  const [panchayatName, setPanchayatName] = useState("ग्रामपंचायत गोहगाव");
  const [taluka, setTaluka] = useState("रिसोड");
  const [district, setDistrict] = useState("वाशिम");
  const [financialYear, setFinancialYear] = useState("२०२६ - २०२७");
  const [contactNo, setContactNo] = useState("07251-XXXXXX");
  const [noticeTemplate, setNoticeTemplate] = useState(
    "मा. सदस्य, ग्रामपंचायत गोहगावची मासिक सभा दि. {date} रोजी दुपारी {time} वाजता आयोजित केली आहे. सभेचा अजेंडा व नोटीस सोबत जोडली आहे. कृपया उपस्थित राहावे."
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.panchayat_name) setPanchayatName(data.panchayat_name);
          if (data.taluka) setTaluka(data.taluka);
          if (data.district) setDistrict(data.district);
          if (data.financial_year) setFinancialYear(data.financial_year);
          if (data.contact_no) setContactNo(data.contact_no);
          if (data.notice_template) setNoticeTemplate(data.notice_template);
        }
      })
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panchayat_name: panchayatName,
          taluka,
          district,
          financial_year: financialYear,
          contact_no: contactNo,
          notice_template: noticeTemplate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "सेटिंग्ज जतन करता आल्या नाहीत.");
      }
      setSavedMessage("सर्व सेटिंग्ज सुरक्षितपणे जतन केल्या आहेत.");
      setTimeout(() => setSavedMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || "त्रुटी आली.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = () => {
    window.location.href = "/api/backup";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {savedMessage && (
        <div className="bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Page Title */}
      <div className="bg-white border border-[#E6EAE5] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#245C45] uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>प्रशासक नियंत्रण कक्ष</span>
        </div>
        <h2 className="text-xl font-bold text-[#202923]">प्रशासक सेटिंग्ज (Admin Settings)</h2>
        <p className="text-xs text-[#68736C] mt-0.5">
          ग्रामपंचायत माहिती, संपर्क, आर्थिक वर्ष, WhatsApp टेम्पलेट व डेटा बॅकअप व्यवस्थापन
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Section 1: Gram Panchayat Details */}
        <div className="bg-white border border-[#E6EAE5] rounded-xl p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[#202923] flex items-center gap-2 border-b border-[#E6EAE5] pb-2.5">
            <Building2 className="w-4 h-4 text-[#245C45]" />
            <span>ग्रामपंचायत तपशील व संपर्क</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#68736C]">ग्रामपंचायतीचे नाव</label>
              <input
                type="text"
                value={panchayatName}
                onChange={(e) => setPanchayatName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6EAE5] rounded-lg text-xs text-[#202923] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#68736C]">तालुका</label>
              <input
                type="text"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6EAE5] rounded-lg text-xs text-[#202923] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#68736C]">जिल्हा</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6EAE5] rounded-lg text-xs text-[#202923] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#68736C]">चालू आर्थिक वर्ष</label>
              <input
                type="text"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6EAE5] rounded-lg text-xs text-[#202923] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#68736C]">कार्यालय संपर्क क्रमांक</label>
              <input
                type="text"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6EAE5] rounded-lg text-xs text-[#202923] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20"
              />
            </div>
          </div>
        </div>

        {/* Section 2: WhatsApp Template */}
        <div className="bg-white border border-[#E6EAE5] rounded-xl p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[#202923] flex items-center gap-2 border-b border-[#E6EAE5] pb-2.5">
            <MessageSquare className="w-4 h-4 text-[#245C45]" />
            <span>WhatsApp मासिक सभा नोटीस मेसेज टेम्पलेट</span>
          </h3>
          <p className="text-xs text-[#68736C]">
            हा मेसेज फक्त ९ अधिकृत समिती सदस्यांना सभेची नोटीस पाठवताना वापरला जाईल.
          </p>

          <textarea
            rows={3}
            value={noticeTemplate}
            onChange={(e) => setNoticeTemplate(e.target.value)}
            className="w-full p-3 border border-[#E6EAE5] rounded-lg text-xs text-[#202923] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45]/20 font-sans leading-relaxed"
          />
        </div>

        {/* Section 3: Backup & Restore */}
        <div className="bg-white border border-[#E6EAE5] rounded-xl p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[#202923] flex items-center gap-2 border-b border-[#E6EAE5] pb-2.5">
            <Database className="w-4 h-4 text-[#245C45]" />
            <span>डेटा बॅकअप व पुनर्प्राप्ती (Backup & Restore)</span>
          </h3>
          <p className="text-xs text-[#68736C]">
            सर्व ३४ वर्कशीट्सचा सुरक्षित डेटाबेस बॅकअप एका क्लिकवर डाऊनलोड करा.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-[#E6EAE5] hover:bg-[#F7F8F5] text-xs font-semibold text-[#202923] transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#245C45]" />
              <span>डेटा बॅकअप डाऊनलोड करा (Full Backup JSON)</span>
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#245C45] text-white hover:bg-[#1D4B38] text-xs font-semibold shadow-xs disabled:opacity-75 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "जतन होत आहे..." : "बदल जतन करा (Save Settings)"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
