"use client";

import React from "react";
import { PropertyRecord } from "@/lib/propertyService";

interface Props {
  property: PropertyRecord;
  printTimestamp: string;
}

export default function UtaraDocument({ property, printTimestamp }: Props) {
  return (
    <div className="utara-document-container w-full bg-white text-black font-sans select-text">
      {/* Container with official double border styling like original sheet */}
      <div className="border-2 border-black p-4 space-y-3 bg-white text-black">
        {/* Header Block matching Google Sheet Rows 4-7 */}
        <div className="text-center space-y-1 border-b-2 border-black pb-2">
          <h2 className="text-xl font-bold tracking-wide">नमुना नंबर ८ उतारा</h2>
          <p className="text-xs font-semibold">नियम ३२ (१)</p>
          <p className="text-sm font-semibold text-neutral-800">
            सन २०२६ - २०२७ ते २०२९ - २०३० या वर्षासाठी आकारणी नोंदवहीचा उतारा
          </p>
          <p className="text-xs font-bold text-neutral-900">
            ग्रामपंचायत कार्यालय, गोहगाव • तालुका : रिसोड • जिल्हा : वाशिम
          </p>
        </div>

        {/* Official 27-Column Statutory Assessment Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-black text-[9px] leading-tight text-center">
            <thead>
              {/* Row 1 of Table Header: Main Grouped Headings */}
              <tr className="bg-neutral-100 font-bold border-b border-black">
                <th rowSpan={3} className="border border-black p-1 w-7">अ.नं.</th>
                <th rowSpan={3} className="border border-black p-1 w-16">रस्त्याचे नाव</th>
                <th rowSpan={3} className="border border-black p-1 w-14">मालमत्ता क्रमांक</th>
                <th rowSpan={3} className="border border-black p-1 text-left w-28">मालकाचे नाव.*</th>
                <th rowSpan={3} className="border border-black p-1 text-left w-20">भोगवटदाराचे नाव</th>
                <th rowSpan={3} className="border border-black p-1 text-left w-24">मालमत्तेचे वर्णन</th>
                <th rowSpan={3} className="border border-black p-1 w-16">मिळकत बांधकामाचे वर्ष</th>
                <th colSpan={4} className="border border-black p-1">क्षेत्रफळ मोजमाप</th>
                <th colSpan={3} className="border border-black p-1">रेडीरेकनर दर प्रती चौ मी. (रुपये)</th>
                <th rowSpan={3} className="border border-black p-1 w-9">घसारा दर</th>
                <th rowSpan={3} className="border border-black p-1 w-10">ईमारतीच्या वापरानुसार भारांक</th>
                <th rowSpan={3} className="border border-black p-1 w-16">भांडवली मुल्य (रुपये)</th>
                <th rowSpan={3} className="border border-black p-1 w-9">कराचा दर (पैसे)</th>
                <th colSpan={5} className="border border-black p-1">कराची रक्कम (₹)</th>
                <th colSpan={5} className="border border-black p-1">अपिलाचे निकाल व त्यानंतर केलेले फेरफार</th>
                <th rowSpan={3} className="border border-black p-1 w-20">नंतर वाढ किवा घट झालेल्या बाबतीत आदेशाच्या संदर्भात शेरा.</th>
              </tr>

              {/* Row 2 of Table Header: Sub-columns */}
              <tr className="bg-neutral-100 font-bold border-b border-black text-[8.5px]">
                {/* Under क्षेत्रफळ मोजमाप */}
                <th className="border border-black p-0.5">लांबी (फुट)</th>
                <th className="border border-black p-0.5">रुंदी (फुट)</th>
                <th className="border border-black p-0.5">क्षेत्रफळ चौ.फुट</th>
                <th className="border border-black p-0.5">क्षेत्रफळ चौ.मी.**</th>
                {/* Under रेडीरेकनर दर */}
                <th className="border border-black p-0.5">जमीन</th>
                <th className="border border-black p-0.5">ईमारत</th>
                <th className="border border-black p-0.5">बांधकाम</th>
                {/* Under कराची रक्कम */}
                <th className="border border-black p-0.5">घरपट्टी</th>
                <th className="border border-black p-0.5">दिवाबत्ती</th>
                <th className="border border-black p-0.5">आरोग्य</th>
                <th className="border border-black p-0.5">पाणीपट्टी</th>
                <th className="border border-black p-0.5 bg-neutral-200">एकुण</th>
                {/* Under अपिलाचे निकाल */}
                <th className="border border-black p-0.5">घरपट्टी</th>
                <th className="border border-black p-0.5">दिवाबत्ती</th>
                <th className="border border-black p-0.5">आरोग्य</th>
                <th className="border border-black p-0.5">पाणीपट्टी</th>
                <th className="border border-black p-0.5 bg-neutral-200">एकुण</th>
              </tr>

              {/* Row 3: Statutory Numbered Column Row matching Row 11 of Google Sheet */}
              <tr className="bg-neutral-50 font-mono text-[8px] border-b-2 border-black text-neutral-600">
                <th className="border border-black p-0.5">1</th>
                <th className="border border-black p-0.5">2</th>
                <th className="border border-black p-0.5">4</th>
                <th className="border border-black p-0.5">5</th>
                <th className="border border-black p-0.5">6</th>
                <th className="border border-black p-0.5">7</th>
                <th className="border border-black p-0.5">8</th>
                <th className="border border-black p-0.5">9-अ</th>
                <th className="border border-black p-0.5">9-ब</th>
                <th className="border border-black p-0.5">9-क</th>
                <th className="border border-black p-0.5">9-ड</th>
                <th className="border border-black p-0.5">10</th>
                <th className="border border-black p-0.5">11</th>
                <th className="border border-black p-0.5">12</th>
                <th className="border border-black p-0.5">13</th>
                <th className="border border-black p-0.5">14</th>
                <th className="border border-black p-0.5">15</th>
                <th className="border border-black p-0.5">16</th>
                <th className="border border-black p-0.5">17</th>
                <th className="border border-black p-0.5">18</th>
                <th className="border border-black p-0.5">19</th>
                <th className="border border-black p-0.5">20</th>
                <th className="border border-black p-0.5 bg-neutral-100">21</th>
                <th className="border border-black p-0.5">22</th>
                <th className="border border-black p-0.5">23</th>
                <th className="border border-black p-0.5">24</th>
                <th className="border border-black p-0.5">25</th>
                <th className="border border-black p-0.5 bg-neutral-100">26</th>
                <th className="border border-black p-0.5">27</th>
              </tr>
            </thead>

            {/* Populated Data Row matching Row 13 of Google Sheet */}
            <tbody className="font-medium">
              <tr className="border-b-2 border-black hover:bg-neutral-50/50">
                <td className="border border-black p-1 font-mono font-bold">{property.sr_no || 1}</td>
                <td className="border border-black p-1 text-left">{property.street_name || "ग्रामठाण रस्ता"}</td>
                <td className="border border-black p-1 font-mono font-bold text-neutral-900 bg-neutral-100/50">
                  {property.property_no}
                </td>
                <td className="border border-black p-1 text-left font-bold">{property.owner_name}</td>
                <td className="border border-black p-1 text-left">{property.occupant_name || "-"}</td>
                <td className="border border-black p-1 text-left">{property.property_description}</td>
                <td className="border border-black p-1">{property.construction_year_bracket}</td>
                <td className="border border-black p-1 font-mono">{property.length_ft}</td>
                <td className="border border-black p-1 font-mono">{property.width_ft}</td>
                <td className="border border-black p-1 font-mono font-semibold">{property.area_sq_ft}</td>
                <td className="border border-black p-1 font-mono font-semibold">
                  {typeof property.area_sq_m === "number" ? property.area_sq_m.toFixed(2) : property.area_sq_m}
                </td>
                <td className="border border-black p-1 font-mono">{property.land_rate}</td>
                <td className="border border-black p-1 font-mono">{property.building_rate || "-"}</td>
                <td className="border border-black p-1 font-mono">{property.construction_rate || 0}</td>
                <td className="border border-black p-1 font-mono">{property.depreciation_rate}</td>
                <td className="border border-black p-1 font-mono">{property.usage_weight}</td>
                <td className="border border-black p-1 font-mono font-bold">
                  {Math.round(property.capital_value).toLocaleString("en-IN")}
                </td>
                <td className="border border-black p-1 font-mono">{property.tax_rate_paise}</td>
                {/* Assessment Tax Amounts */}
                <td className="border border-black p-1 font-mono text-right">{property.house_tax_current}</td>
                <td className="border border-black p-1 font-mono text-right">{property.light_tax_current}</td>
                <td className="border border-black p-1 font-mono text-right">{property.health_tax_current}</td>
                <td className="border border-black p-1 font-mono text-right">{property.water_tax_current}</td>
                <td className="border border-black p-1 font-mono font-bold text-right bg-neutral-100">
                  {property.house_tax_current + property.light_tax_current + property.health_tax_current + property.water_tax_current}
                </td>
                {/* Appeal Amounts */}
                <td className="border border-black p-1 font-mono text-right">{property.appeal_house_tax || "-"}</td>
                <td className="border border-black p-1 font-mono text-right">{property.appeal_light_tax || "-"}</td>
                <td className="border border-black p-1 font-mono text-right">{property.appeal_health_tax || "-"}</td>
                <td className="border border-black p-1 font-mono text-right">{property.appeal_water_tax || "-"}</td>
                <td className="border border-black p-1 font-mono text-right bg-neutral-100">{property.appeal_total || "-"}</td>
                <td className="border border-black p-1 text-left text-[8.5px]">{property.remarks || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chaturseema Section matching Google Sheet Rows 15-17 */}
        <div className="border border-black text-xs">
          <div className="bg-neutral-100 font-bold px-2 py-1 border-b border-black text-center text-[10px]">
            चतुःसीमा (Boundaries)
          </div>
          <div className="grid grid-cols-4 divide-x divide-black text-[10px]">
            <div className="p-1.5">
              <span className="font-bold block text-neutral-600 text-[9px]">पूर्व :</span>
              <p className="font-semibold mt-0.5">{property.east || "शेतजमीन / रस्ता"}</p>
            </div>
            <div className="p-1.5">
              <span className="font-bold block text-neutral-600 text-[9px]">पश्चिम :</span>
              <p className="font-semibold mt-0.5">{property.west || "ग्रामपंचायत रस्ता"}</p>
            </div>
            <div className="p-1.5">
              <span className="font-bold block text-neutral-600 text-[9px]">उत्तर :</span>
              <p className="font-semibold mt-0.5">{property.north || "शेजारील मिळकत"}</p>
            </div>
            <div className="p-1.5">
              <span className="font-bold block text-neutral-600 text-[9px]">दक्षिण :</span>
              <p className="font-semibold mt-0.5">{property.south || "मोकळी जागा"}</p>
            </div>
          </div>
        </div>

        {/* Other Details & Personal Information matching Google Sheet Rows 18-20 */}
        <div className="border border-black text-xs">
          <div className="bg-neutral-100 font-bold px-2 py-1 border-b border-black text-center text-[10px]">
            इतर तपशील व वैयक्तिक माहिती (Additional Information)
          </div>
          <div className="grid grid-cols-5 divide-x divide-black text-[10px]">
            <div className="p-1.5">
              <span className="font-bold block text-neutral-600 text-[9px]">मोबाईल नंबर :</span>
              <p className="font-mono font-semibold mt-0.5">{property.mobile_no || "-"}</p>
            </div>
            <div className="p-1.5">
              <span className="font-bold block text-neutral-600 text-[9px]">आधार नंबर :</span>
              <p className="font-mono font-semibold mt-0.5">{property.aadhaar_no || "-"}</p>
            </div>
            <div className="p-1.5">
              <span className="font-bold block text-neutral-600 text-[9px]">ईमेल पत्ता :</span>
              <p className="font-mono text-[9px] truncate mt-0.5">{property.email || "-"}</p>
            </div>
            <div className="p-1.5">
              <span className="font-bold block text-neutral-600 text-[9px]">घरकुल लाभ :</span>
              <p className="font-semibold mt-0.5">{property.gharkul_benefit || "-"}</p>
            </div>
            <div className="p-1.5">
              <span className="font-bold block text-neutral-600 text-[9px]">शौचालय :</span>
              <p className="font-semibold mt-0.5">{property.toilet || "आहे"}</p>
            </div>
          </div>
        </div>

        {/* Official Statutory Notes matching Google Sheet Rows 21-22 */}
        <div className="border border-neutral-300 p-2 bg-neutral-50/70 text-[9px] text-neutral-800 space-y-0.5 leading-tight rounded-xs">
          <p className="font-bold text-[9.5px]">टीप :</p>
          <p>
            १. सदर मालमत्ता आकारणी नोंदवही उतारा केवळ ग्रामपंचायत कर आकारणी बाबत असून इतर कोणत्याही हक्काबाबत हा दस्त कायदेशीर पुरावा नाही.
          </p>
          <p>
            २. नमूद मोजमापे ही कर आकारणीच्या उद्देशाने घेतलेली असून तांत्रिकदृष्ट्या प्रमाणित किंवा भूमापन नकाशाप्रमाणे नाहीत.
          </p>
        </div>

        {/* Footer, Signatures & Automatic Kolkata Print Timestamp matching Google Sheet Rows 25-26 */}
        <div className="pt-4 flex items-end justify-between text-xs px-2">
          <div className="space-y-0.5">
            <p className="text-[10px] text-neutral-700">
              दिनांक : <strong className="font-mono">{printTimestamp}</strong>
            </p>
            <p className="font-bold text-[10.5px]">गोहगाव</p>
            <p className="text-[9px] text-neutral-500 font-mono">
              मुद्रण टाइमस्टॅम्प (Asia/Kolkata): {printTimestamp}
            </p>
          </div>

          <div className="text-center space-y-0.5">
            <div className="h-8"></div>
            <p className="font-bold text-xs">ग्रामपंचायत अधिकारी / सरपंच</p>
            <p className="text-[10px] text-neutral-700">ग्रामपंचायत कार्यालय गोहगाव</p>
            <p className="text-[9px] text-neutral-500">(स्वाक्षरी व अधिकृत शिक्का)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
