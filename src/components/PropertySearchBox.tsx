"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, Building2, User, Phone, Check } from "lucide-react";

export interface PropertySearchResultItem {
  property_no: string;
  sr_no: string | number;
  owner_name: string;
  street_name: string;
  mobile_no: string;
  aadhaar_no: string;
  grand_total: number;
  match_type: string;
}

interface Props {
  selectedPropertyNo: string;
  onSelectProperty: (propertyNo: string) => void;
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  label?: string;
}

export default function PropertySearchBox({
  selectedPropertyNo,
  onSelectProperty,
  isLoading = false,
  error = null,
  placeholder = "उदा. 7A, 15A, 6B, 1, किंवा करदात्याचे नाव...",
  label = "🔍 मिळकत क्र. किंवा नाव शोधा :",
}: Props) {
  const [inputValue, setInputValue] = useState(selectedPropertyNo);
  const [suggestions, setSuggestions] = useState<PropertySearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(selectedPropertyNo);
  }, [selectedPropertyNo]);

  // Debounced search for suggestions
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/lookup/property/search?q=${encodeURIComponent(trimmed)}&limit=15`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.results)) {
            setSuggestions(data.results);
            setIsOpen(data.results.length > 0);
          }
        })
        .catch(() => {
          // ignore aborted/network error
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 150);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: PropertySearchResultItem) => {
    setInputValue(item.property_no);
    setIsOpen(false);
    onSelectProperty(item.property_no);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else if (inputValue.trim()) {
        setIsOpen(false);
        onSelectProperty(inputValue.trim());
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="no-print bg-[#F6F7F5] p-3.5 rounded-lg border border-[#E1E5E1] space-y-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-[#252A27] flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#245C45]" />
          <span>{label}</span>
        </span>

        {/* Input & Autocomplete Dropdown Container */}
        <div ref={dropdownRef} className="relative flex-1 min-w-[260px] max-w-md">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-white border border-[#E1E5E1] rounded px-3 py-1.5 text-xs font-mono font-bold text-[#245C45] focus:outline-none focus:border-[#245C45] focus:ring-1 focus:ring-[#245C45] pr-8"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  inputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#245C45] rounded-md shadow-lg max-h-72 overflow-y-auto divide-y divide-neutral-100 text-xs">
              <div className="bg-[#EAF1EC] px-3 py-1.5 text-[11px] font-semibold text-[#245C45] flex justify-between items-center">
                <span>सापडलेल्या मिळकती ({suggestions.length})</span>
                <span className="text-[10px] text-neutral-500 font-normal">मिळकत क्र. / नाव निवडा</span>
              </div>
              {suggestions.map((item) => {
                const isSelected = item.property_no.toUpperCase() === selectedPropertyNo.toUpperCase();
                return (
                  <button
                    key={`${item.property_no}-${item.sr_no}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F0F5F2] transition-colors ${
                      isSelected ? "bg-[#EAF1EC]/70" : ""
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-[#245C45] text-white px-1.5 py-0.5 rounded">
                          मिळकत {item.property_no}
                        </span>
                        <span className="text-[11px] font-semibold text-neutral-800">
                          {item.owner_name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#245C45]" />}
                      </div>
                      <div className="flex items-center gap-3 text-[10.5px] text-neutral-500">
                        <span className="font-mono text-neutral-400">अ.क्र.: {item.sr_no}</span>
                        {item.mobile_no && (
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            {item.mobile_no}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.grand_total > 0 && (
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-700">
                          ₹{item.grand_total}
                        </span>
                        <p className="text-[9.5px] text-neutral-400">एकूण कर</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {(isLoading || isSearching) && (
          <span className="text-xs text-[#245C45] flex items-center gap-1 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> शोधत आहे...
          </span>
        )}

        {/* Error Message */}
        {error && (
          <span className="text-xs text-rose-600 font-medium">
            ⚠️ {error}
          </span>
        )}

        <span className="text-xs text-[#747C76] ml-auto hidden md:block">
          (अ.क्र. व मिळकत क्रमांक स्वतंत्रपणे हाताळले जातात)
        </span>
      </div>

      {/* Quick Access Badges for Test/Common Properties */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-[#E1E5E1]">
        <span className="text-[11px] font-semibold text-[#747C76] mr-1">त्वरित निवडा:</span>
        {[
          { no: "1", label: "१ (प्रल्हाद हाडे)" },
          { no: "2", label: "२ (अशोक काठोळे)" },
          { no: "4A", label: "४A (सौ रेखा हाडे)" },
          { no: "5A", label: "५A (सुभाष हाडे)" },
          { no: "6B", label: "६B (ऋषिकेश हाडे)" },
          { no: "7A", label: "७A (भास्कर हाडे)" },
          { no: "15A", label: "१५A (नामदेव हाडे)" },
        ].map((item) => (
          <button
            key={item.no}
            type="button"
            onClick={() => {
              setInputValue(item.no);
              onSelectProperty(item.no);
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
              selectedPropertyNo.toUpperCase() === item.no.toUpperCase()
                ? "bg-[#245C45] text-white border-[#245C45]"
                : "bg-white text-[#252A27] border-[#E1E5E1] hover:bg-[#EAF1EC]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
