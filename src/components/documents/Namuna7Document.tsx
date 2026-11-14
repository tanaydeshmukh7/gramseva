"use client";

import React from "react";

export interface Namuna7FormState {
  bookNo: string;
  receiptNo: string;
  date: string;
  financialYear: string;
  payerName: string;
  address: string;
  reason: string;
  accountHead: string;
  amountWords: string;
  amount: string | number;
  paymentMode: string;
  referenceNo: string;
  bankName: string;
  mobileNo?: string;
  aadhaarNo?: string;
}

interface Props {
  data: Namuna7FormState;
  printTimestamp: string;
}

export default function Namuna7Document({ data, printTimestamp }: Props) {
  const effectiveDate = data.date || printTimestamp;

  const renderSingleCopy = (copyTitle: string) => (
    <div className="receipt-7-container border-2 border-black p-3.5 space-y-2 bg-white text-black text-[11px] leading-tight select-text rounded-xs">
      {/* 1. Top Deities Banner matching Google Sheet Row 1 */}
      <div className="flex justify-between items-center text-[10px] font-bold text-neutral-800 border-b border-black pb-1 px-1">
        <span>संत गाडगेबाबा</span>
        <span>राष्ट्रसंत तुकडोजी महाराज</span>
      </div>

      {/* 2. Header matching Google Sheet Rows 2-4 */}
      <div className="text-center space-y-0.5 border-b border-black pb-1.5">
        <h3 className="text-base font-bold tracking-wide">ग्रामपंचायत गोहगाव</h3>
        <p className="text-xs font-semibold">नमुना नं. ७ (नियम ३७ (२) पहा)</p>
        <p className="text-xs font-bold text-neutral-900">
          सामान्य पावती [ {copyTitle} ]
        </p>
      </div>

      {/* 3. Metadata Rows matching Google Sheet Rows 5-6 */}
      <div className="grid grid-cols-2 gap-2 text-[10.5px] border-b border-black pb-1 px-0.5">
        <div className="space-y-0.5">
          <p>
            बुक नंबर : <strong className="font-mono">{data.bookNo || "ब-०१"}</strong>
          </p>
          <p>
            तारीख : <strong className="font-mono">{effectiveDate}</strong>
          </p>
        </div>
        <div className="text-right space-y-0.5">
          <p>
            पावती नं. : <strong className="font-mono">{data.receiptNo}</strong>
          </p>
          <p>
            आर्थिक वर्ष : <strong>{data.financialYear || "२०२६ - २०२७"}</strong>
          </p>
        </div>
      </div>

      {/* 4. Body matching Google Sheet Rows 8-13 */}
      <div className="space-y-1.5 text-[11px] py-1 border-b border-black">
        <div className="flex items-start gap-1">
          <span className="font-semibold text-neutral-700 shrink-0">श्री. / श्रीमती :</span>
          <span className="font-bold text-neutral-900 border-b border-dotted border-black flex-1 pb-0.5">
            {data.payerName || "करदाता / नागरिक"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-start gap-1">
            <span className="font-semibold text-neutral-700 shrink-0">रा. (पत्ता/वॉर्ड) :</span>
            <span className="font-medium text-neutral-900 border-b border-dotted border-black flex-1 pb-0.5">
              {data.address || "गोहगाव"}
            </span>
          </div>
          {data.mobileNo && (
            <div className="flex items-start gap-1 justify-end text-[10px]">
              <span className="font-semibold text-neutral-700">मोबाईल :</span>
              <span className="font-mono font-medium">{data.mobileNo}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-start gap-1">
            <span className="font-semibold text-neutral-700 shrink-0">कशाबद्दल मिळाले :</span>
            <span className="font-medium text-neutral-900 border-b border-dotted border-black flex-1 pb-0.5">
              {data.reason || "दाखले फी (जन्म/मृत्यू/रहिवासी)"}
            </span>
          </div>
          <div className="flex items-start gap-1">
            <span className="font-semibold text-neutral-700 shrink-0">बाब / लेखाशीर्ष :</span>
            <span className="font-medium text-neutral-900 border-b border-dotted border-black flex-1 pb-0.5">
              {data.accountHead || "सामान्य फंड / इतर फी"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-1">
          <span className="font-semibold text-neutral-700 shrink-0">अक्षरी रुपये :</span>
          <span className="font-bold text-neutral-900 border-b border-dotted border-black flex-1 pb-0.5">
            {data.amountWords || `रुपये ${data.amount} /- फक्त`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-1.5 rounded-xs border border-neutral-200">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-800">मिळालेली रक्कम :</span>
            <span className="font-mono font-black text-sm text-neutral-900">₹{data.amount}/-</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <span className="font-semibold text-neutral-700">भरणा प्रकार :</span>
            <span className="font-medium">{data.paymentMode || "रोख (Cash)"}</span>
          </div>
        </div>

        {(data.referenceNo || data.bankName) && (
          <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-700">
            <div>संदर्भ / चेक क्र. : <strong className="font-mono">{data.referenceNo || "-"}</strong></div>
            <div className="text-right">बँकेचे नाव : <strong>{data.bankName || "-"}</strong></div>
          </div>
        )}
      </div>

      {/* 5. Statutory Declaration matching Google Sheet Row 14 */}
      <p className="text-[10px] text-neutral-800 italic text-center py-0.5">
        सदर रक्कम ग्रामपंचायत गोहगाव यांच्या ग्रामनिधी खाती जमा करून पावती देण्यात येत आहे.
      </p>

      {/* 6. Signatures matching Google Sheet Rows 16-18 */}
      <div className="pt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold border-t border-neutral-300">
        <div>
          <div className="h-6"></div>
          <p>पैसे देणाऱ्याची सही</p>
          <p className="text-[8.5px] text-neutral-500 font-normal">(खातेदार / नागरिक)</p>
        </div>
        <div>
          <div className="h-6"></div>
          <p>पैसे स्वीकारणाऱ्याची सही</p>
          <p className="text-[8.5px] text-neutral-500 font-normal">(वसुली कारकून / लिपिक)</p>
        </div>
        <div>
          <div className="h-6"></div>
          <p>ग्रामसेवक / ग्रा.वि.अधिकारी / सरपंच</p>
          <p className="text-[8.5px] text-neutral-500 font-normal">ग्रामपंचायत गोहगाव (स्वाक्षरी व अधिकृत शिक्का)</p>
        </div>
      </div>

      {/* 7. Official Notes matching Google Sheet Rows 19-20 */}
      <div className="pt-1 text-[8.5px] text-neutral-600 space-y-0.5 border-t border-dotted border-neutral-300 leading-tight">
        <p>टीप : ही पावती ग्रामपंचायत गोहगावच्या अधिकृत शिक्क्याशिवाय व स्वाक्षरीशिवाय ग्राह्य धरली जाणार नाही.</p>
        <p>नोंद : दैनिक रोकड वही (नमुना ५-क) व सामान्य रोकड वही (नमुना ५) मध्ये नोंद घेतली आहे.</p>
      </div>

      {/* 8. Footer with Automatic Kolkata Print Timestamp */}
      <div className="border-t border-dotted border-neutral-400 pt-0.5 flex justify-between items-center text-[8.5px] text-neutral-500">
        <span>संगणकीकृत पावती (नमुना ७) - ग्रामपंचायत गोहगाव</span>
        <span className="font-mono">मुद्रण : {printTimestamp}</span>
      </div>
    </div>
  );

  return (
    <div className="namuna-7-document-container w-full bg-white select-text">
      {/* 1. Original Copy [ मूळ प्रत / Original ] */}
      {renderSingleCopy("मूळ प्रत / Original")}

      {/* Cut Divider matching Google Sheet Row 22 */}
      <div className="my-2.5 text-center text-[10px] text-neutral-400 select-none tracking-widest flex items-center justify-center gap-2">
        <span>✂️</span>
        <span className="border-b border-dashed border-neutral-400 w-full inline-block"></span>
        <span className="shrink-0 text-[9px] uppercase font-mono">येथून कट करा / Cut Here</span>
        <span className="border-b border-dashed border-neutral-400 w-full inline-block"></span>
        <span>✂️</span>
      </div>

      {/* 2. Office Copy [ कार्यालयीन प्रत (OC) ] */}
      {renderSingleCopy("कार्यालयीन प्रत (OC)")}
    </div>
  );
}
