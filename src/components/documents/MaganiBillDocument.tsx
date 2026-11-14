"use client";

import React from "react";
import { PropertyRecord } from "@/lib/propertyService";

interface Props {
  property: PropertyRecord;
  printTimestamp: string;
}

export default function MaganiBillDocument({ property, printTimestamp }: Props) {
  const billNo = property.bill_no || `ब-${property.property_no}`;
  const billDate = property.bill_date || "01/06/2026";

  const renderSingleBill = (copyTitle: string) => (
    <div className="bill-copy-container border-2 border-black p-3.5 space-y-2 bg-white text-black text-[11px] leading-tight select-text rounded-xs">
      {/* Header matching Google Sheet Rows 4-6 */}
      <div className="text-center border-b border-black pb-1.5 space-y-0.5">
        <h3 className="text-base font-bold tracking-wide">ग्रामपंचायत कार्यालय, गोहगाव</h3>
        <p className="text-xs font-bold text-neutral-900">
          वार्षिक कर मागणी बिल (सन २०२६ - २०२७) [ {copyTitle} ]
        </p>
        <p className="text-[10px] text-neutral-600">तालुका : रिसोड, जिल्हा : वाशिम</p>
      </div>

      {/* Metadata Grid matching Google Sheet Rows 7-8 */}
      <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-black pb-1.5 px-0.5">
        <div className="space-y-0.5">
          <p>
            बिल क्रमांक : <strong className="font-mono">{billNo}</strong>
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
            बिल दिनांक : <strong className="font-mono">{billDate}</strong>
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

      {/* Statutory 6-Column Assessment Table matching Google Sheet Rows 10-15 */}
      <table className="w-full border-collapse border border-black text-[10.5px]">
        <thead>
          <tr className="bg-neutral-100 border-b border-black font-bold">
            <th className="p-1 border-r border-black w-9 text-center">अ.क्र.</th>
            <th className="p-1 border-r border-black text-left">कराचा तपशील / बाबी</th>
            <th className="p-1 border-r border-black text-right w-24">मागील थकीत (₹)</th>
            <th className="p-1 border-r border-black text-right w-24">चालू मागणी (₹)</th>
            <th className="p-1 border-r border-black text-right w-24">एकूण देय कर (₹)</th>
            <th className="p-1 text-center w-24">शेरा</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black">
            <td className="p-1 text-center border-r border-black font-mono">1</td>
            <td className="p-1 border-r border-black font-medium">इमारत व जमीन कर (घरकर)</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.house_tax_arrears}</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.house_tax_current}</td>
            <td className="p-1 text-right border-r border-black font-mono font-bold">{property.house_tax_total}</td>
            <td className="p-1 text-center text-[9.5px]">वार्षिक आकारणी</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 text-center border-r border-black font-mono">2</td>
            <td className="p-1 border-r border-black font-medium">दिवाबत्ती कर (दिवाकर)</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.light_tax_arrears}</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.light_tax_current}</td>
            <td className="p-1 text-right border-r border-black font-mono font-bold">{property.light_tax_total}</td>
            <td className="p-1 text-center text-[9.5px]">वार्षिक आकारणी</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 text-center border-r border-black font-mono">3</td>
            <td className="p-1 border-r border-black font-medium">सामान्य आरोग्य कर (सफाई कर)</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.health_tax_arrears}</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.health_tax_current}</td>
            <td className="p-1 text-right border-r border-black font-mono font-bold">{property.health_tax_total}</td>
            <td className="p-1 text-center text-[9.5px]">वार्षिक आकारणी</td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-1 text-center border-r border-black font-mono">4</td>
            <td className="p-1 border-r border-black font-medium">सामान्य पाणीपट्टी कर</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.water_tax_arrears}</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.water_tax_current}</td>
            <td className="p-1 text-right border-r border-black font-mono font-bold">{property.water_tax_total}</td>
            <td className="p-1 text-center text-[9.5px]">वार्षिक आकारणी</td>
          </tr>
          {/* Total Row */}
          <tr className="bg-neutral-100 font-bold border-t border-black">
            <td className="p-1 text-center border-r border-black">एकूण</td>
            <td className="p-1 border-r border-black">एकूण देय कर रक्कम</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.total_arrears}</td>
            <td className="p-1 text-right border-r border-black font-mono">{property.total_current}</td>
            <td className="p-1 text-right border-r border-black font-mono font-black text-sm text-neutral-900">
              ₹{property.grand_total}
            </td>
            <td className="p-1 text-center font-normal text-[9px] text-neutral-600">अंतिम देय</td>
          </tr>
        </tbody>
      </table>

      {/* Important Instructions matching Google Sheet Rows 17-20 */}
      <div className="pt-0.5 space-y-0.5 text-[9px] text-neutral-800 leading-tight">
        <p className="font-bold text-[9.5px]">महत्त्वाच्या सूचना :</p>
        <p>१. हे बिल मिळाल्यापासून १५ दिवसांच्या आत कराची रक्कम ग्रामपंचायत कार्यालयात जमा करावी.</p>
        <p>२. वेळेत कर भरून ग्रामविकासास सहकार्य करावे. मुदतीनंतर नियमानुसार विलंब शुल्क / दंड आकारला जाईल.</p>
        <p>३. रक्कम जमा केल्यावर अधिकृत पावती (नमुना १०) आवर्जून प्राप्त करून घ्यावी.</p>
      </div>

      {/* Signatures matching Google Sheet Rows 22-23 */}
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

      {/* Footer matching Google Sheet Row 24 with automatic Kolkata print timestamp */}
      <div className="border-t border-dotted border-neutral-400 pt-0.5 flex justify-between items-center text-[8.5px] text-neutral-500">
        <span>संगणकीकृत कर मागणी बिल - ग्रामपंचायत गोहगाव | स्वच्छ गाव, सुंदर गाव</span>
        <span className="font-mono">मुद्रण : {printTimestamp}</span>
      </div>
    </div>
  );

  return (
    <div className="magani-bill-document-container w-full bg-white select-text">
      {/* 1. Original Copy [ मूळ प्रत ] */}
      {renderSingleBill("मूळ प्रत")}

      {/* Cut Divider matching Google Sheet Row 26 */}
      <div className="my-2.5 text-center text-[10px] text-neutral-400 select-none tracking-widest flex items-center justify-center gap-2">
        <span>✂️</span>
        <span className="border-b border-dashed border-neutral-400 w-full inline-block"></span>
        <span className="shrink-0 text-[9px] uppercase font-mono">येथून कट करा / Cut Here</span>
        <span className="border-b border-dashed border-neutral-400 w-full inline-block"></span>
        <span>✂️</span>
      </div>

      {/* 2. Office Copy [ कार्यालयीन प्रत (OC) ] */}
      {renderSingleBill("कार्यालयीन प्रत (OC)")}
    </div>
  );
}
