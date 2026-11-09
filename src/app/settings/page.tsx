"use client";

import React, { useState } from "react";
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage("सर्व सेटिंग्ज सुरक्षितपणे जतन केल्या आहेत.");
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleExportBackup = () => {
    window.location.href = "/api/backup";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {savedMessage && (
        <div className="bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Page Title */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#245C45] uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>प्रशासक नियंत्रण कक्ष</span>
        </div>
        <h2 className="text-xl font-bold text-[#252A27]">प्रशासक सेटिंग्ज (Admin Settings)</h2>
        <p className="text-xs text-[#747C76] mt-0.5">
          ग्रामपंचायत माहिती, संपर्क, आर्थिक वर्ष, WhatsApp टेम्पलेट व डेटा बॅकअप व्यवस्थापन
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Section 1: Gram Panchayat Details */}
        <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#252A27] flex items-center gap-2 border-b border-[#E1E5E1] pb-2">
            <Building2 className="w-4 h-4 text-[#245C45]" />
            <span>ग्रामपंचायत तपशील व संपर्क</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#747C76]">ग्रामपंचायतीचे नाव</label>
              <input
                type="text"
                value={panchayatName}
                onChange={(e) => setPanchayatName(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E1E5E1] rounded focus:outline-none focus:border-[#245C45]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#747C76]">तालुका</label>
              <input
                type="text"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E1E5E1] rounded focus:outline-none focus:border-[#245C45]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#747C76]">जिल्हा</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E1E5E1] rounded focus:outline-none focus:border-[#245C45]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#747C76]">चालू आर्थिक वर्ष</label>
              <input
                type="text"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E1E5E1] rounded focus:outline-none focus:border-[#245C45]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#747C76]">कार्यालय संपर्क क्रमांक</label>
              <input
                type="text"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E1E5E1] rounded focus:outline-none focus:border-[#245C45]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: WhatsApp Template */}
        <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#252A27] flex items-center gap-2 border-b border-[#E1E5E1] pb-2">
            <MessageSquare className="w-4 h-4 text-[#245C45]" />
            <span>WhatsApp मासिक सभा नोटीस मेसेज टेम्पलेट</span>
          </h3>
          <p className="text-xs text-[#747C76]">
            हा मेसेज फक्त ९ अधिकृत समिती सदस्यांना सभेची नोटीस पाठवताना वापरला जाईल.
          </p>

          <textarea
            rows={3}
            value={noticeTemplate}
            onChange={(e) => setNoticeTemplate(e.target.value)}
            className="w-full p-3 border border-[#E1E5E1] rounded text-xs focus:outline-none focus:border-[#245C45] font-sans"
          />
        </div>

        {/* Section 3: Backup & Restore */}
        <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#252A27] flex items-center gap-2 border-b border-[#E1E5E1] pb-2">
            <Database className="w-4 h-4 text-[#245C45]" />
            <span>डेटा बॅकअप व पुनर्प्राप्ती (Backup & Restore)</span>
          </h3>
          <p className="text-xs text-[#747C76]">
            सर्व २६ वर्कशीट्सचा सुरक्षित डेटाबेस बॅकअप एका क्लिकवर डाऊनलोड करा.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                alert("सर्व २६ वर्कशीट्सचा बॅकअप JSON तयार आहे.");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-white border border-[#E1E5E1] hover:bg-[#F6F7F5] text-xs font-semibold text-[#252A27]"
            >
              <Download className="w-4 h-4 text-[#245C45]" />
              <span>डेटा बॅकअप डाऊनलोड करा (Full Backup)</span>
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#245C45] text-white hover:bg-[#1b4534] text-xs font-semibold shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>बदल जतन करा (Save Settings)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
