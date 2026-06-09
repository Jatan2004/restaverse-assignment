import { useState, useMemo, useEffect, useRef } from "react";
import EmployeeList from "./components/EmployeeList";
import EmployeeTable from "./components/EmployeeTable";
import ProfileDrawer from "./components/ProfileDrawer";
import AddEmployeeModal from "./components/AddEmployeeModal";
import useEmployeeSearch from "./hooks/useEmployeeSearch";
import { Search, X, Sun, Moon, Plus, Users, PieChart as PieChartIcon, LayoutGrid, List as ListIcon, User } from "lucide-react";
import { Button } from "./components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/ui/select";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import "./index.css";

const DEPARTMENTS = ["Engineering", "Marketing", "Human Resources", "Finance", "Sales", "Operations"];

const DEPT_COLORS = {
  engineering: "bg-emerald-600",
  marketing: "bg-amber-500",
  "human resources": "bg-green-500",
  finance: "bg-slate-500",
  sales: "bg-rose-500",
  operations: "bg-zinc-600",
};

const chartConfig = {
  engineering: { label: "Engineering", color: "#059669" },
  marketing: { label: "Marketing", color: "#f59e0b" },
  "human_resources": { label: "Human Resources", color: "#22c55e" },
  finance: { label: "Finance", color: "#64748b" },
  sales: { label: "Sales", color: "#f43f5e" },
  operations: { label: "Operations", color: "#52525b" },
};

// Count-up hook for smooth statistics animations
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

export default function App() {
  const { data, loading, error, setSearchTerm, retry, refresh, searchTerm } = useEmployeeSearch();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deptFilter, setDeptFilter] = useState("");
  const [sortField, setSortField] = useState("name");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const searchRef = useRef(null);
  
  // Theme support state (persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  // Apply theme class synchronously on mount
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    const root = window.document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", nextTheme);
  };

  // Show customized toasts
  const showToast = (message, type = "success") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data;
    if (deptFilter) {
      list = list.filter(e => e.department.toLowerCase() === deptFilter.toLowerCase());
    }
    return [...list].sort((a, b) => {
      if (sortField === "date") {
        const dateDiff = new Date(b.date_of_joining) - new Date(a.date_of_joining);
        return dateDiff !== 0 ? dateDiff : b.id - a.id;
      }
      return a.name.localeCompare(b.name);
    });
  }, [data, sortField, deptFilter]);

  // Department counts based on loaded data
  const deptCounts = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, e) => {
      acc[e.department] = (acc[e.department] || 0) + 1;
      return acc;
    }, {});
  }, [data]);

  // Filter out recent hires (joined in last 60 days)
  const newHiresList = useMemo(() => {
    if (!data) return [];
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    return data
      .filter(e => new Date(e.date_of_joining).getTime() > sixtyDaysAgo.getTime())
      .sort((a, b) => {
        const dateDiff = new Date(b.date_of_joining) - new Date(a.date_of_joining);
        return dateDiff !== 0 ? dateDiff : b.id - a.id;
      });
  }, [data]);

  const chartData = useMemo(() => {
    return DEPARTMENTS.map(d => {
      const key = d.toLowerCase().replace(" ", "_");
      return {
        department: key,
        value: deptCounts[d] ?? 0,
        fill: `var(--color-${key})`
      };
    }).filter(d => d.value > 0);
  }, [deptCounts]);

  const total = data?.length ?? 0;
  const countTotal = useCountUp(total);
  const countNew = useCountUp(newHiresList.length);

  const handleEmployeeAdded = (newEmp) => {
    refresh();
    showToast(`Successfully added ${newEmp.name} to the team!`);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            
            {/* Brand Text Header */}
            <span className="text-foreground text-sm font-extrabold tracking-widest uppercase select-none shrink-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              restaverse people
            </span>

            {/* Quick Search Header Widget (Desktop Only) */}
            <div className="hidden md:block flex-1 max-w-md relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-zinc-500 dark:group-focus-within:text-zinc-400 transition-colors pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search people directory..."
                className="w-full h-9 pl-9 pr-8 rounded-xl text-xs bg-background text-foreground border border-ring ring-2 ring-ring/30 outline-none transition-all placeholder:text-muted-foreground"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theme Switcher Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-xl hover:bg-muted text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to {theme === "dark" ? "Light" : "Dark"} mode</p>
                </TooltipContent>
              </Tooltip>

              {/* Add Employee Button */}
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-xl font-bold shadow-sm flex items-center gap-2 text-xs border-none"
              >
                <Plus className="w-4 h-4" /> Add Employee
              </Button>
            </div>
          </div>
        </header>

        {/* ─── Main Content Grid ─────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
          
          {/* Mobile Search Widget */}
          <div className="block md:hidden mb-6 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-zinc-500 dark:group-focus-within:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, department..."
              className="w-full h-11 pl-10 pr-9 rounded-xl text-sm bg-background text-foreground border border-ring ring-2 ring-ring/30 outline-none transition-all placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Main List Column (takes 3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              <Tabs defaultValue="grid" className="w-full">
                {/* Filter and sorting controls dropdowns */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Department select filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">Department:</span>
                      <Select value={deptFilter || "all"} onValueChange={(val) => setDeptFilter(val === "all" ? "" : val)}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {DEPARTMENTS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sorting select component */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">Sort by:</span>
                      <Select value={sortField} onValueChange={setSortField}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="date">Date Joined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <TabsList className="grid w-full sm:w-[120px] grid-cols-2">
                    <TabsTrigger value="grid"><LayoutGrid className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="list"><ListIcon className="w-4 h-4" /></TabsTrigger>
                  </TabsList>
                </div>

                {/* View Contents */}
                <TabsContent value="grid" className="mt-6 border-none p-0 outline-none">
                  <EmployeeList
                    employees={filtered}
                    loading={loading}
                    error={error}
                    searchTerm={searchTerm}
                    deptFilter={deptFilter}
                    onRetry={retry}
                    onSelectEmployee={setSelectedEmployee}
                    totalCount={total}
                  />
                </TabsContent>
                <TabsContent value="list" className="mt-6 border-none p-0 outline-none">
                  <EmployeeTable
                    employees={filtered}
                    loading={loading}
                    error={error}
                    searchTerm={searchTerm}
                    deptFilter={deptFilter}
                    onRetry={retry}
                    onSelectEmployee={setSelectedEmployee}
                    totalCount={total}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Statistics & Insights Sidebar (takes 1 col) */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto no-scrollbar pb-4">
              
              {/* Quick Stats Card */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-zinc-900 dark:text-white">
                    <Users className="w-4 h-4 text-primary" /> Directory Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-4">
                  <div className="flex flex-col gap-3">
                    {/* Total card */}
                    <div className="bg-secondary/40 dark:bg-zinc-800/20 border border-border/50 rounded-xl p-3.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Employees</span>
                      <span className="text-xl font-extrabold tracking-tight tabular-nums">{countTotal}</span>
                    </div>

                    {/* New hires card */}
                    <div className="bg-secondary/40 dark:bg-zinc-800/20 border border-border/50 rounded-xl p-3.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Hires</span>
                      <span className="text-xl font-extrabold tracking-tight text-primary tabular-nums">{countNew}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Department Breakdown Card */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-zinc-900 dark:text-white">
                    <PieChartIcon className="w-4 h-4 text-amber-500" /> Departments
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  {total > 0 ? (
                    <div className="flex flex-col items-center w-full">
                      <ChartContainer config={chartConfig} className="mx-auto w-full max-w-[150px] aspect-square">
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="department"
                            innerRadius="60%"
                            strokeWidth={3}
                            stroke="var(--card)"
                          />
                        </PieChart>
                      </ChartContainer>
                      
                      {/* Custom Legend to prevent overflow cut-offs */}
                      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mt-1 pb-1">
                        {DEPARTMENTS.map(d => {
                          const colKey = d.toLowerCase().replace(" ", "_");
                          const color = chartConfig[colKey]?.color || "#ccc";
                          return (
                            <div key={d} className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: color }} />
                              <span className="text-[11px] font-medium text-muted-foreground leading-none">{d}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-10">No data available</div>
                  )}
                </CardContent>
              </Card>

              {/* Recently Joined List sidebar widget */}
              {newHiresList.length > 0 && (
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader className="p-5 pb-0">
                    <CardTitle className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white">
                      Welcome New Hires
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-4">
                    <div className="flex flex-col gap-3">
                      {newHiresList.slice(0, 4).map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => setSelectedEmployee(emp)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted cursor-pointer transition-all border border-transparent hover:border-border/60"
                        >
                          <Avatar className={`w-8 h-8 rounded-lg select-none ${
                            emp.department === 'Engineering' ? 'bg-emerald-600' :
                            emp.department === 'Marketing' ? 'bg-amber-500' :
                            emp.department === 'Human Resources' ? 'bg-green-500' :
                            emp.department === 'Finance' ? 'bg-slate-500' :
                            emp.department === 'Sales' ? 'bg-rose-500' :
                            'bg-zinc-600'
                          }`}>
                            <AvatarFallback className="bg-transparent text-zinc-100 font-bold text-xs flex items-center justify-center">
                              {emp.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{emp.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{emp.designation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </main>

        {/* ─── Modals and Overlays ───────────────────────────────── */}
        <ProfileDrawer
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />

        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onEmployeeAdded={handleEmployeeAdded}
        />

      </div>

      {/* Floating success toast notifier */}
      <Toaster theme={theme} position="bottom-right" />
    </TooltipProvider>
  );
}
