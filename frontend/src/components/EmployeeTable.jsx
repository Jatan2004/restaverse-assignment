import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { getAvatarColors } from "../lib/utils";
import { AlertCircle, RotateCcw, Users } from "lucide-react";
import { Button } from "./ui/button";

function initials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function tenure(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24 * 365.25));
  if (diff < 1) return "New Hire";
  return `${diff} yr${diff !== 1 ? "s" : ""}`;
}

function Highlight({ text, q }) {
  if (!q || !q.trim()) return <>{text}</>;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return (
    <>
      {text.split(re).map((p, i) =>
        re.test(p) ? (
          <mark key={i} className="bg-amber-200/80 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 rounded px-0.5">{p}</mark>
        ) : <span key={i}>{p}</span>
      )}
    </>
  );
}

export default function EmployeeTable({
  employees, loading, error, searchTerm, deptFilter,
  onRetry, onSelectEmployee
}) {
  if (loading) {
    return (
      <div className="border border-border dark:border-zinc-800 rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Tenure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-10 w-48 bg-muted animate-pulse rounded-lg" /></TableCell>
                <TableCell><div className="h-6 w-24 bg-muted animate-pulse rounded-lg" /></TableCell>
                <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded-lg" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-destructive/30 rounded-2xl bg-destructive/5 my-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 text-destructive">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Connection Failure</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">{error}</p>
        <Button onClick={onRetry} variant="outline" className="mt-6 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10">
          <RotateCcw className="w-3.5 h-3.5 mr-2" /> Try again
        </Button>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-border rounded-2xl bg-card">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-5 text-zinc-400 shadow-inner">
          <Users className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">No matches found</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          We couldn't find any employees matching <span className="font-semibold text-foreground">"{searchTerm || deptFilter}"</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground font-medium">
        Showing <span className="text-foreground font-semibold">{employees.length}</span> employee{employees.length !== 1 ? "s" : ""}
      </p>

      <div className="border border-border dark:border-zinc-800 rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-foreground">Employee</TableHead>
              <TableHead className="font-bold text-foreground">Department</TableHead>
              <TableHead className="font-bold text-foreground hidden md:table-cell">Contact</TableHead>
              <TableHead className="font-bold text-foreground hidden sm:table-cell">Tenure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => {
              const t = tenure(emp.date_of_joining);
              return (
                <TableRow
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp)}
                  className="cursor-pointer group transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className={`w-10 h-10 rounded-xl ${getAvatarColors(emp.department).bg}`}>
                        <AvatarFallback className={`bg-transparent font-bold text-xs ${getAvatarColors(emp.department).text}`}>
                          {initials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-foreground">
                          <Highlight text={emp.name} q={searchTerm} />
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          <Highlight text={emp.designation} q={searchTerm} />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[11px] font-semibold">
                      {emp.department}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                      {emp.email}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className={`text-[10px] font-semibold border-border ${
                      t === "New Hire" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "text-muted-foreground"
                    }`}>
                      {t}
                    </Badge>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {formatDate(emp.date_of_joining)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
