"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRightLeft,
  Settings,
  Database,
  History,
} from "lucide-react";

export default function SyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<"two_way" | "pull" | "push">("two_way");
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [conflictPolicy, setConflictPolicy] = useState<"admin_review" | "sheets_wins" | "app_wins">("admin_review");
  const [lastSyncTime, setLastSyncTime] = useState<string>("पडताळणी चालू...");
  const [syncStatus, setSyncStatus] = useState<string>("सक्रिय (Active)");
  const [logs, setLogs] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchSyncData = async () => {
    try {
      const res = await fetch("/api/sync");
      if (res.ok) {
        const data = await res.json();
        if (data.last_sync_timestamp) {
          const dateObj = new Date(data.last_sync_timestamp);
          setLastSyncTime(dateObj.toLocaleString("mr-IN"));
        }
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(
            data.logs.map((l: any) => ({
              id: l.id,
              time: new Date(l.timestamp).toLocaleString("mr-IN"),
              sheet: l.sheet,
              action: l.action,
              records: l.details || `${l.records_processed} नोंदी`,
              status: l.status === "SUCCESS" ? "यशस्वी" : "त्रुटी",
            }))
          );
        }
      }
    } catch (e) {
      console.error("Error loading sync data:", e);
    }
  };

  useEffect(() => {
    fetchSyncData();
  }, []);

  const handleRunSync = async () => {
    setIsSyncing(true);
    setNotification(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: syncDirection, conflictPolicy }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "सिंक्रोनायझेशन अयशस्वी.");
      }
      const nowStr = new Date().toLocaleString("mr-IN");
      setLastSyncTime(nowStr);
      setNotification({
        type: "success",
        message: data.message || "गुगल शीट्स सिंक्रोनायझेशन यशस्वी झाले.",
      });
      await fetchSyncData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "सिंक करताना त्रुटी आली.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      {notification && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
            notification.type === "success"
              ? "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#245C45] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
            <span>गुगल शीट्स द्वि-मार्गी सिंक्रोनायझेशन केंद्र</span>
          </div>
          <h2 className="text-xl font-bold text-[#252A27]">
            Google Sheets Synchronisation & Data Integrity
          </h2>
          <p className="text-xs text-[#747C76] mt-0.5">
            स्प्रेडशीट आणि सॉफ्टवेअरमधील डेटा सदैव एकसमान (Real-Time Synced) ठेवण्याची प्रणाली
          </p>
        </div>

        <button
          onClick={handleRunSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#245C45] text-white hover:bg-[#1b4534] text-xs font-medium shadow-xs disabled:opacity-75 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "डेटा सिंक होत आहे..." : "आत्ताच संपूर्ण सिंक करा"}</span>
        </button>
      </div>

      {/* Primary Connection Details Card */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#252A27] flex items-center gap-2">
          <Database className="w-4 h-4 text-[#245C45]" />
          <span>सक्रिय Google Spreadsheet दुवा व स्थिती</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-[#F6F7F5] rounded-lg border border-[#E1E5E1] space-y-1">
            <span className="text-[11px] font-semibold text-[#747C76] block">
              स्प्रेडशीट आयडी (Spreadsheet ID)
            </span>
            <span className="text-xs font-mono font-bold text-[#252A27] block truncate" title="17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk">
              17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk
            </span>
            <a
              href="https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#245C45] font-semibold flex items-center gap-1 hover:underline pt-1"
            >
              <span>Google Sheets मध्ये उघडा</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3 bg-[#F6F7F5] rounded-lg border border-[#E1E5E1] space-y-1">
            <span className="text-[11px] font-semibold text-[#747C76] block">
              सिंक स्थिती (Connection Status)
            </span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
              <span className="text-xs font-bold text-[#2E7D32]">सक्रिय (Active & Online)</span>
            </div>
            <p className="text-[11px] text-[#747C76]">सर्व २६ वर्कशीट्स संलग्न</p>
          </div>

          <div className="p-3 bg-[#F6F7F5] rounded-lg border border-[#E1E5E1] space-y-1">
            <span className="text-[11px] font-semibold text-[#747C76] block">
              शेवटचा यशस्वी सिंक (Last Sync)
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#252A27] pt-0.5">
              <Clock className="w-3.5 h-3.5 text-[#245C45]" />
              <span>{lastSyncTime}</span>
            </div>
            <p className="text-[11px] text-[#2E7D32]">सर्व सूत्रे व मूल्ये सुरक्षित</p>
          </div>
        </div>
      </div>

      {/* Sync Configuration Panel */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#252A27] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#245C45]" />
          <span>सिंक्रोनायझेशन सेटिंग्ज व नियम (Sync Policies)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Option 1: Sync Direction */}
          <div className="space-y-1.5 p-3 rounded-lg border border-[#E1E5E1]">
            <label className="font-semibold text-[#252A27] block">
              सिंक दिशा (Sync Direction)
            </label>
            <p className="text-[#747C76] text-[11px]">
              डेटा दोन्ही बाजूंनी कसा परावर्तित व्हावा ते निवडा.
            </p>
            <div className="space-y-1 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  checked={syncDirection === "two_way"}
                  onChange={() => setSyncDirection("two_way")}
                  className="text-[#245C45]"
                />
                <span className="font-medium">द्वि-मार्गी (Two-Way Sync - Recommended)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  checked={syncDirection === "pull"}
                  onChange={() => setSyncDirection("pull")}
                  className="text-[#245C45]"
                />
                <span>फक्त गुगल शीट्स वरून सॉफ्टवेअरमध्ये घ्या (Pull Only)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  checked={syncDirection === "push"}
                  onChange={() => setSyncDirection("push")}
                  className="text-[#245C45]"
                />
                <span>फक्त सॉफ्टवेअरवरून गुगल शीट्सवर पाठवा (Push Only)</span>
              </label>
            </div>
          </div>

          {/* Option 2: Conflict Resolution */}
          <div className="space-y-1.5 p-3 rounded-lg border border-[#E1E5E1]">
            <label className="font-semibold text-[#252A27] block">
              संघर्ष हाताळणी धोरण (Conflict Resolution)
            </label>
            <p className="text-[#747C76] text-[11px]">
              दोन्हीकडे एकाच वेळी बदल झाल्यास काय करावे?
            </p>
            <div className="space-y-1 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictPolicy === "admin_review"}
                  onChange={() => setConflictPolicy("admin_review")}
                  className="text-[#245C45]"
                />
                <span className="font-medium">प्रशासकास दाखवून निर्णय घ्या (Admin Review)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictPolicy === "sheets_wins"}
                  onChange={() => setConflictPolicy("sheets_wins")}
                  className="text-[#245C45]"
                />
                <span>गुगल शीट्समधील बदल कायम ठेवा (Sheets Wins)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictPolicy === "app_wins"}
                  onChange={() => setConflictPolicy("app_wins")}
                  className="text-[#245C45]"
                />
                <span>सॉफ्टवेअरमधील बदल कायम ठेवा (App Wins)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Audit History Log */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E1E5E1] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#252A27] flex items-center gap-2">
            <History className="w-4 h-4 text-[#245C45]" />
            <span>सिंक्रोनायझेशन इतिहास व ऑडिट लॉग (Sync History)</span>
          </h3>
          <span className="text-xs text-[#747C76]">
            एकूण {logs.length} घटना नोंदवल्या
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#F6F7F5] border-b border-[#E1E5E1] text-[#747C76] font-semibold">
            <tr>
              <th className="py-2.5 px-4">वेळ (Timestamp)</th>
              <th className="py-2.5 px-4">वर्कशीट</th>
              <th className="py-2.5 px-4">कृती (Action)</th>
              <th className="py-2.5 px-4">तपशील</th>
              <th className="py-2.5 px-4 text-center">स्थिती</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E5E1]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F6F7F5]">
                <td className="py-2.5 px-4 font-mono text-[#747C76]">{log.time}</td>
                <td className="py-2.5 px-4 font-medium text-[#252A27]">{log.sheet}</td>
                <td className="py-2.5 px-4 text-[#747C76]">{log.action}</td>
                <td className="py-2.5 px-4 text-[#252A27]">{log.records}</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">
                    ✓ {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
