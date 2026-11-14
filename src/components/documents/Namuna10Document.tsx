"use client";

import React from "react";
import { PropertyRecord } from "@/lib/propertyService";

interface Props {
  property: PropertyRecord;
  receiptNo?: string;
  receiptDate?: string;
  paymentMode?: string;
  printTimestamp: string;
}

export default function Namuna10Document({
  property,
  receiptNo,
  receiptDate,
  paymentMode = "रोख (Cash) / ऑनलाइन",
  printTimestamp,
}: Props) {
  const effectiveReceiptNo = receiptNo?.trim() || property.receipt_no || `पा-${property.property_no}`;
  const effectiveDate = receiptDate || printTimestamp;
  const collected = property.collected_amount || property.grand_total;
  const balance = Math.max(0, property.grand_total - collected);
  const status = balance === 0 ? "पूर्ण भरणा (PAID)" : "अंशतः भरणा (PARTIAL)";

  const renderSingleReceipt = (copyTitle: string) => (
    <div className="receipt-copy-container border-2 border-black p-3.5 space-y-2 bg-white text-black text-[11px] leading-tight select-text rounded-xs">
      {/* Header matching Google Sheet Rows 5-7 */}
      <div className="text-center border-b border-black pb-1.5 space-y-0.5">
        <h3 className="text-base font-bold tracking-wide">ग्रामपंचायत कार्यालय, गोहगाव</h3>
        <p className="text-xs font-bold text-neutral-900">
          नमुना १० (नियम २२ (१२) पहा) - कर व फी वसुली पावती [ {copyTitle} ]
        </p>
        <p className="text-[10px] text-neutral-600">आर्थिक वर्ष : २०२६ - २०२७</p>
      </div>

      {/* Metadata Grid matching Google Sheet Rows 9-10 */}
      <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-black pb-1.5 px-0.5">
        <div className="space-y-0.5">
          <p>
            पावती क्रमांक : <strong className="font-mono">{effectiveReceiptNo}</strong>
          </p>
          <p>
            करदात्याचे नाव : <strong>{property.owner_name}</strong>
          </p>
          {property.mobile_no && (
            <p className="text-[10px] text-neutral-600">
              मोबाईल : <span className="font-mono">{property.mobile_no}</span>
            </p>
          )}
        </div>
        <div className="text-right space-y-0.5">
          <p>
            पावती दिनांक : <strong className="font-mono">{effectiveDate}</strong>
          </p>
          <p>
            मिळकत क्रमांक : <strong className="font-mono text-sm">{property.property_no}</strong>
          </p>
          {property.aadhaar_no && (
            <p className="text-[10px] text-neutral-600">
              आधार : <span className="font-mono">{property.aadhaar_no}</span>
            </p>
          )}
        </div>
      </div>

      {/* Statutory 6-Column Tax Table matching Google Sheet Rows 12-17 */}
      <table className="w-full border-collapse border border-black text-[10.5px]">
        <thead>
          <tr className="bg-neutral-100 border-b border-black font-bold">
            <th className="p-1 border-r border-black w-9 text-center">अ.क्र.</th>
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
            <td className="p-1 border-r border-black font-medium">इमारत व जमीन कर (घरकर)</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.house_tax_arrears}</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.house_tax_current}</td>
            <td className="p-1 text-right border-r border-black font-mono font-medium">{property.house_tax_total}</td>
            <td className="p-1 text-right font-mono font-bold">{property.house_tax_total}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 text-center border-r border-black font-mono">2</td>
            <td className="p-1 border-r border-black font-medium">दिवाबत्ती कर (दिवाकर)</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.light_tax_arrears}</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.light_tax_current}</td>
            <td className="p-1 text-right border-r border-black font-mono font-medium">{property.light_tax_total}</td>
            <td className="p-1 text-right font-mono font-bold">{property.light_tax_total}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 text-center border-r border-black font-mono">3</td>
            <td className="p-1 border-r border-black font-medium">सामान्य आरोग्य कर (सफाई कर)</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.health_tax_arrears}</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.health_tax_current}</td>
            <td className="p-1 text-right border-r border-black font-mono font-medium">{property.health_tax_total}</td>
            <td className="p-1 text-right font-mono font-bold">{property.health_tax_total}</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 text-center border-r border-black font-mono">4</td>
            <td className="p-1 border-r border-black font-medium">सामान्य पाणीपट्टी कर</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.water_tax_arrears}</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.water_tax_current}</td>
            <td className="p-1 text-right border-r border-black font-mono font-medium">{property.water_tax_total}</td>
            <td className="p-1 text-right font-mono font-bold">{property.water_tax_total}</td>
          </tr>
          {/* Total Row */}
          <tr className="bg-neutral-100 font-bold border-t border-black">
            <td className="p-1 text-center border-r border-black">एकूण</td>
            <td className="p-1 border-r border-black">एकूण देय व वसूल कर रक्कम</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.total_arrears}</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.total_current}</td>
            <td className="p-1 text-right border-r border-black font-mono font-bold">₹{property.grand_total}</td>
            <td className="p-1 text-right font-mono font-black text-sm text-neutral-900">₹{collected}</td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words & Payment Mode matching Google Sheet Rows 18-19 */}
      <div className="space-y-1 text-[10px] pt-1 border-t border-neutral-300">
        <div className="flex justify-between items-center bg-neutral-50 p-1.5 rounded-xs border border-neutral-200">
          <div>
            <span className="font-semibold text-neutral-600">अक्षरी रक्कम : </span>
            <span className="font-bold text-neutral-900">
              रुपये {collected} /- फक्त (Rupees {collected} Only)
            </span>
          </div>
          <div>
            <span className="font-semibold text-neutral-600">भरणा प्रकार : </span>
            <span className="font-medium text-neutral-900">{paymentMode}</span>
          </div>
        </div>

        <div className="flex justify-between items-center px-1 text-[10px]">
          <div>
            <span className="text-neutral-600">शिल्लक बाकी : </span>
            <strong className="font-mono text-neutral-900">₹{balance}</strong>
          </div>
          <div>
            <span className="text-neutral-600">पावती स्थिती : </span>
            <strong className={status.includes("PAID") ? "text-emerald-800" : "text-amber-800"}>
              {status}
            </strong>
          </div>
        </div>
      </div>

      {/* Important Conditions matching Google Sheet Rows 21-23 */}
      <div className="pt-0.5 space-y-0.5 text-[9px] text-neutral-800 leading-tight">
        <p className="font-bold text-[9.5px]">महत्त्वाच्या सूचना व अटी :</p>
        <p>१. ही पावती अधिकृत संगणकीकृत पावती असून ग्रामपंचायत गोहगावच्या मागणी नोंदवहीशी (नमुना ९) थेट संलग्न आहे.</p>
        <p>२. धनादेश / ऑनलाईन व्यवहाराच्या बाबतीत रक्कम ग्रामपंचायत बँक खात्यात जमा झाल्यावरच ही पावती वैध राहील.</p>
      </div>

      {/* Signatures matching Google Sheet Rows 25-26 */}
      <div className="pt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold border-t border-neutral-300">
        <div>
          <div className="h-5"></div>
          <p>कर वसुली लिपिक</p>
          <p className="text-[9px] text-neutral-500 font-normal">ग्रामपंचायत गोहगाव</p>
        </div>
        <div>
          <div className="h-5"></div>
          <p>ग्रामसेवक / ग्रा.वि.अ.</p>
          <p className="text-[9px] text-neutral-500 font-normal">ग्रामपंचायत गोहगाव</p>
        </div>
        <div>
          <div className="h-5"></div>
          <p>सरपंच / उपसरपंच</p>
          <p className="text-[9px] text-neutral-500 font-normal">ग्रामपंचायत गोहगाव</p>
        </div>
      </div>

      {/* Footer matching Google Sheet Row 28 with automatic Kolkata print timestamp */}
      <div className="border-t border-dotted border-neutral-400 pt-0.5 flex justify-between items-center text-[8.5px] text-neutral-500">
        <span>संगणकीकृत कर पावती - ग्रामपंचायत गोहगाव | स्वच्छ गाव, सुंदर गाव, समृद्ध गाव !</span>
        <span className="font-mono">मुद्रण : {printTimestamp}</span>
      </div>
    </div>
  );

  return (
    <div className="namuna-10-document-container w-full bg-white select-text">
      {/* 1. Original Copy [ मूळ प्रत ] */}
      {renderSingleReceipt("मूळ प्रत")}

      {/* Cut Divider matching Google Sheet Row 30 */}
      <div className="my-2.5 text-center text-[10px] text-neutral-400 select-none tracking-widest flex items-center justify-center gap-2">
        <span>✂️</span>
        <span className="border-b border-dashed border-neutral-400 w-full inline-block"></span>
        <span className="shrink-0 text-[9px] uppercase font-mono">येथून कट करा / Cut Here</span>
        <span className="border-b border-dashed border-neutral-400 w-full inline-block"></span>
        <span>✂️</span>
      </div>

      {/* 2. Office Copy [ कार्यालयीन प्रत (OC) ] */}
      {renderSingleReceipt("कार्यालयीन प्रत (OC)")}
    </div>
  );
}
