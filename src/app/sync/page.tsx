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
  Copy,
  Check,
  Eye,
  EyeOff,
  Code2,
  Radio,
  Save,
} from "lucide-react";

export default function SyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<"two_way" | "pull" | "push">("two_way");
  const [conflictPolicy, setConflictPolicy] = useState<"admin_review" | "sheets_wins" | "app_wins">("admin_review");
  const [lastSyncTime, setLastSyncTime] = useState<string>("पडताळणी चालू...");
  const [gasWebAppUrl, setGasWebAppUrl] = useState<string>("");
  const [webhookSecret, setWebhookSecret] = useState<string>("gramseva_gohgaon_secure_sync_token_2026");
  const [showSecret, setShowSecret] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  // Webhook URL dynamically determined from browser host
  const [webhookUrl, setWebhookUrl] = useState("http://localhost:3000/api/webhook/google-sheets");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/webhook/google-sheets`);
    }
  }, []);

  const fetchSyncData = async () => {
    try {
      const res = await fetch("/api/sync");
      if (res.ok) {
        const data = await res.json();
        if (data.last_sync_timestamp) {
          const dateObj = new Date(data.last_sync_timestamp);
          setLastSyncTime(dateObj.toLocaleString("mr-IN"));
        }
        if (data.gas_web_app_url) setGasWebAppUrl(data.gas_web_app_url);
        if (data.webhook_secret) setWebhookSecret(data.webhook_secret);
        if (data.sync_direction) setSyncDirection(data.sync_direction);
        if (data.conflict_policy) setConflictPolicy(data.conflict_policy);

        if (data.logs && Array.isArray(data.logs)) {
          setLogs(
            data.logs.map((l: any) => ({
              id: l.id,
              time: new Date(l.timestamp).toLocaleString("mr-IN"),
              sheet: l.sheet,
              action: l.action,
              records: l.details || `${l.records_processed} नोंदी`,
              status: l.status,
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

  // Save Config
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    setNotification(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_CONFIG",
          config: {
            gas_web_app_url: gasWebAppUrl,
            webhook_secret: webhookSecret,
            sync_direction: syncDirection,
            conflict_policy: conflictPolicy,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "सेटिंग्ज सेव्ह करता आल्या नाहीत.");
      setNotification({
        type: "success",
        message: "सिंक्रोनायझेशन सेटिंग्ज यशस्वीरित्या सुरक्षितपणे जतन केल्या आहेत.",
      });
      await fetchSyncData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Run Manual Full Sync
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

  // Test Webhook Listener
  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    try {
      const res = await fetch("/api/webhook/google-sheets");
      const data = await res.json();
      if (res.ok && data.status === "WEBHOOK_READY") {
        setNotification({
          type: "success",
          message: "✓ Gramसेवा इनबाउंड वेबबुक सक्रिय आहे व Google Apps Script संदेश स्वीकारण्यास सज्ज आहे.",
        });
      } else {
        throw new Error(data.error || "वेबबुक प्रतिसाद मिळाला नाही.");
      }
    } catch (err: any) {
      setNotification({ type: "error", message: `वेबबुक चाचणी अयशस्वी: ${err.message}` });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Alert Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 border transition-all ${
            notification.type === "success"
              ? "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]"
              : notification.type === "warning"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D32]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#245C45] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
            <span>गुगल शीट्स द्वि-मार्गी सिंक्रोनायझेशन केंद्र</span>
          </div>
          <h2 className="text-xl font-bold text-[#252A27]">
            Google Sheets Real-Time Bidirectional Sync
          </h2>
          <p className="text-xs text-[#747C76] mt-0.5">
            स्प्रेडशीट आणि Gramसेवा मधील डेटा सदैव एकसमान (Real-Time Synced) ठेवण्याची अधिकृत प्रणाली
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTestWebhook}
            disabled={isTestingWebhook}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-white border border-[#E1E5E1] text-[#252A27] hover:bg-[#F6F7F5] text-xs font-medium shadow-xs disabled:opacity-75"
          >
            <Radio className={`w-3.5 h-3.5 text-[#245C45] ${isTestingWebhook ? "animate-pulse" : ""}`} />
            <span>{isTestingWebhook ? "तपासणी..." : "वेबबुक चाचणी"}</span>
          </button>

          <button
            onClick={handleRunSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#245C45] text-white hover:bg-[#1b4534] text-xs font-semibold shadow-xs disabled:opacity-75 shrink-0 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "डेटा सिंक होत आहे..." : "आत्ताच संपूर्ण सिंक करा (Sync Now)"}</span>
          </button>
        </div>
      </div>

      {/* Connection & Webhook Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spreadsheet Status */}
        <div className="bg-white border border-[#E1E5E1] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#747C76] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#245C45]" />
              <span>Google Spreadsheet</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">
              सक्रिय
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-[#252A27] block truncate" title="17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk">
            17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk
          </span>
          <a
            href="https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#245C45] font-semibold flex items-center gap-1 hover:underline pt-0.5"
          >
            <span>Google Sheets मध्ये उघडा</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Real-time Webhook URL */}
        <div className="bg-white border border-[#E1E5E1] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#747C76] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#245C45]" />
              <span>इनबाउंड वेबबुक URL (Inbound Webhook)</span>
            </span>
            <button
              onClick={() => copyToClipboard(webhookUrl, setCopiedWebhook)}
              className="text-[10px] text-[#245C45] hover:underline flex items-center gap-0.5"
            >
              {copiedWebhook ? <Check className="w-3 h-3 text-[#2E7D32]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedWebhook ? "कॉपी झाले" : "कॉपी करा"}</span>
            </button>
          </div>
          <div className="text-[11px] font-mono bg-[#F6F7F5] p-1.5 rounded border border-[#E1E5E1] truncate text-[#252A27]" title={webhookUrl}>
            {webhookUrl}
          </div>
          <p className="text-[10px] text-[#747C76]">Google Apps Script onEdit ट्रिगर या URL वर संदेश पाठवतो.</p>
        </div>

        {/* Secret Token & Last Sync */}
        <div className="bg-white border border-[#E1E5E1] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#747C76] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#245C45]" />
              <span>सुरक्षित सीक्रेट टोकन (Auth Secret)</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="text-[10px] text-[#747C76] hover:text-[#252A27]"
              >
                {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
              <button
                onClick={() => copyToClipboard(webhookSecret, setCopiedSecret)}
                className="text-[10px] text-[#245C45] hover:underline flex items-center gap-0.5"
              >
                {copiedSecret ? <Check className="w-3 h-3 text-[#2E7D32]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="text-[11px] font-mono bg-[#F6F7F5] p-1.5 rounded border border-[#E1E5E1] truncate text-[#252A27]">
            {showSecret ? webhookSecret : "••••••••••••••••••••••••••••••"}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-[#747C76]">शेवटचा सिंक:</span>
            <span className="font-semibold text-[#252A27]">{lastSyncTime}</span>
          </div>
        </div>
      </div>

      {/* Outbound Sync Configuration: Google Apps Script Web App URL */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E1E5E1] pb-3">
          <h3 className="text-sm font-bold text-[#252A27] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#245C45]" />
            <span>द्वि-मार्गी आउटबाउंड सिंक (Gramसेवा ➔ Google Sheets)</span>
          </h3>
          <span className="text-xs text-[#747C76]">
            Gramसेवा मधील बदल गुगल शीटमध्ये परावर्तित करण्यासाठी
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-[#252A27] block mb-1">
              Google Apps Script Web App URL (Deploy as Web App URL)
            </label>
            <p className="text-[11px] text-[#747C76] mb-2">
              Google Spreadsheet मध्ये `Code.gs` वेब ॲप म्हणून उपयोजित (Deploy) केल्यावर मिळालेला URL येथे प्रविष्ट करा.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={gasWebAppUrl}
                onChange={(e) => setGasWebAppUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-[#E1E5E1] rounded text-xs font-mono focus:outline-none focus:border-[#245C45]"
              />
              <button
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#245C45] text-white hover:bg-[#1b4534] text-xs font-semibold shadow-xs disabled:opacity-75 shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingConfig ? "जतन होत आहे..." : "सेटिंग्ज जतन करा"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Policies: Direction & Conflict Resolution */}
      <div className="bg-white border border-[#E1E5E1] rounded-lg p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#252A27] flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#245C45]" />
          <span>सिंक्रोनायझेशन धोरणे व संघर्ष हाताळणी (Sync & Conflict Policies)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Sync Direction */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-[#E1E5E1] bg-[#F6F7F5]/50">
            <label className="font-bold text-[#252A27] block">
              सिंक दिशा (Sync Direction)
            </label>
            <p className="text-[#747C76] text-[11px] mb-2">
              दोन्ही बाजूंमधील माहिती प्रवाह कसा असावा?
            </p>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  checked={syncDirection === "two_way"}
                  onChange={() => setSyncDirection("two_way")}
                  className="text-[#245C45]"
                />
                <span className="font-semibold text-[#252A27]">द्वि-मार्गी (Two-Way Sync — शिफारस केलेले)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  checked={syncDirection === "pull"}
                  onChange={() => setSyncDirection("pull")}
                  className="text-[#245C45]"
                />
                <span>केवळ गुगल शीट्स वरून ॲपमध्ये घ्या (Pull Only)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  checked={syncDirection === "push"}
                  onChange={() => setSyncDirection("push")}
                  className="text-[#245C45]"
                />
                <span>केवळ Gramसेवा वरून गुगल शीट्सवर पाठवा (Push Only)</span>
              </label>
            </div>
          </div>

          {/* Conflict Policy */}
          <div className="space-y-1.5 p-3.5 rounded-lg border border-[#E1E5E1] bg-[#F6F7F5]/50">
            <label className="font-bold text-[#252A27] block">
              संघर्ष हाताळणी धोरण (Conflict Resolution)
            </label>
            <p className="text-[#747C76] text-[11px] mb-2">
              दोन्हीकडे एकाच नोंदीमध्ये बदल झाल्यास प्राधान्य:
            </p>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictPolicy === "admin_review"}
                  onChange={() => setConflictPolicy("admin_review")}
                  className="text-[#245C45]"
                />
                <span className="font-semibold text-[#252A27]">प्रशासकास दाखवून निर्णय घ्या (Admin Review)</span>
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
                <span>Gramसेवा मधील बदल कायम ठेवा (App Wins)</span>
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
            <span>सिंक्रोनायझेशन इतिहास व ऑडिट लॉग (Live Sync Audit History)</span>
          </h3>
          <span className="text-xs text-[#747C76]">
            एकूण {logs.length} घटना नोंदवल्या
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F7F5] border-b border-[#E1E5E1] text-[#747C76] font-semibold">
              <tr>
                <th className="py-2.5 px-4">वेळ (Timestamp)</th>
                <th className="py-2.5 px-4">स्रोत (Source)</th>
                <th className="py-2.5 px-4">वर्कशीट</th>
                <th className="py-2.5 px-4">कृती (Action)</th>
                <th className="py-2.5 px-4">तपशील</th>
                <th className="py-2.5 px-4 text-center">स्थिती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E5E1]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F6F7F5]/80">
                  <td className="py-2.5 px-4 font-mono text-[#747C76] whitespace-nowrap">{log.time}</td>
                  <td className="py-2.5 px-4 text-[#252A27] font-medium whitespace-nowrap">{log.source || "Google Sheets"}</td>
                  <td className="py-2.5 px-4 font-medium text-[#245C45] whitespace-nowrap">{log.sheet}</td>
                  <td className="py-2.5 px-4 text-[#747C76] whitespace-nowrap">{log.action}</td>
                  <td className="py-2.5 px-4 text-[#252A27] min-w-[200px]">{log.records}</td>
                  <td className="py-2.5 px-4 text-center whitespace-nowrap">
                    {log.status === "SUCCESS" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">
                        ✓ यशस्वी
                      </span>
                    ) : log.status === "WARNING" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ⚠ इशारा
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        ✗ त्रुटी
                      </span>
                    )}
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
