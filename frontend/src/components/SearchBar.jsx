import { Search, LayoutGrid, LayoutList, ArrowUpDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DEPARTMENTS = ["All", "Engineering", "Marketing", "Human Resources", "Finance", "Sales", "Operations"];

export default function SearchBar({
  value,
  onChange,
  viewMode,
  onViewModeChange,
  sortField,
  onSortFieldChange,
}) {
  return (
    <div className="flex flex-col gap-3">

      {/* Primary search row */}
      <div className="flex items-center gap-2.5">

        {/* Search input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
          <Input
            id="search-input"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search by name, department, or role…"
            className="pl-10 h-10 bg-white border-slate-200/80 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-indigo-500/20 focus-visible:border-indigo-300 shadow-sm transition-all"
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 p-1 bg-white border border-slate-200/80 rounded-xl shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            id="view-grid"
            className={`w-8 h-8 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-slate-100 text-slate-700"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => onViewModeChange("grid")}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            id="view-table"
            className={`w-8 h-8 rounded-lg transition-all ${
              viewMode === "table"
                ? "bg-slate-100 text-slate-700"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => onViewModeChange("table")}
            title="Table view"
          >
            <LayoutList className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Secondary filter/sort row */}
      <div className="flex items-center justify-between gap-3">

        {/* Department pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3 h-3 text-slate-400 shrink-0" />
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => {
                if (dept === "All") {
                  onChange("");
                } else {
                  onChange(dept);
                }
              }}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all ${
                (dept === "All" && !value) || value === dept
                  ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1 shrink-0">
          <ArrowUpDown className="w-3 h-3 text-slate-400" />
          <button
            onClick={() => onSortFieldChange("name")}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-all ${
              sortField === "name"
                ? "text-indigo-600 bg-indigo-50"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            Name
          </button>
          <button
            onClick={() => onSortFieldChange("date")}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-all ${
              sortField === "date"
                ? "text-indigo-600 bg-indigo-50"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            Date
          </button>
        </div>
      </div>

    </div>
  );
}
