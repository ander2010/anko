import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { useEnterprise } from "../context/enterprise-context";

export function CompanySelector() {
  const { companies, activeCompanyId, membership, switchCompany } = useEnterprise();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (companies.length === 0) return null;
  if (companies.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200">
        <BuildingOfficeIcon className="h-4 w-4 text-zinc-500" />
        <span className="text-sm font-semibold text-zinc-700">{membership?.company_name || "Company"}</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors"
      >
        <BuildingOfficeIcon className="h-4 w-4 text-zinc-500" />
        <span className="text-sm font-semibold text-zinc-700">{membership?.company_name || "Select Company"}</span>
        <ChevronDownIcon className="h-3 w-3 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden min-w-[200px]">
          {companies.map((c) => (
            <button
              key={c.company_id}
              onClick={() => { switchCompany(c.company_id); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 transition-colors flex items-center gap-3 ${String(c.company_id) === String(activeCompanyId) ? "bg-indigo-50 text-indigo-700 font-bold" : "text-zinc-700 font-medium"}`}
            >
              <BuildingOfficeIcon className="h-4 w-4 flex-shrink-0" />
              <div>
                <div className="font-semibold">{c.company_name}</div>
                <div className="text-xs text-zinc-400 capitalize">{c.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanySelector;
