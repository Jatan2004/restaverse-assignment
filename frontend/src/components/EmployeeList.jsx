import EmployeeCard from "./EmployeeCard";
import { Card, CardContent, CardFooter } from "./ui/card";
import { AlertCircle, RotateCcw, Users } from "lucide-react";
import { Button } from "./ui/button";

import { Skeleton } from "./ui/skeleton";

function SkeletonCard() {
  return (
    <Card className="border border-border dark:border-zinc-800 bg-card rounded-2xl overflow-hidden shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <Skeleton className="h-5 w-16 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-36 rounded mb-2" />
        <Skeleton className="h-4 w-24 rounded mb-4" />
        <Skeleton className="h-5 w-20 rounded-lg" />
      </CardContent>
      <CardFooter className="px-6 py-4 border-t border-border dark:border-zinc-800 flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardFooter>
    </Card>
  );
}

export default function EmployeeList({
  employees, loading, error, searchTerm, deptFilter,
  onRetry, onSelectEmployee
}) {

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
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
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {error}
        </p>
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-6 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Try again
        </Button>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-border rounded-2xl bg-card">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-5 text-zinc-400 dark:text-zinc-500 shadow-inner">
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
    <div className="flex flex-col gap-6">
      {/* Count details */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">
          Showing <span className="text-foreground font-semibold">{employees.length}</span>{" "}
          employee{employees.length !== 1 ? "s" : ""}
          {searchTerm && <> for <span className="text-foreground font-bold">"{searchTerm}"</span></>}
          {deptFilter && <> in <span className="text-foreground font-bold">{deptFilter}</span></>}
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map((emp, idx) => (
          <div
            key={emp.id}
            className="card-in"
            style={{ animationDelay: `${idx * 0.04}s` }}
          >
            <EmployeeCard
              employee={emp}
              highlight={searchTerm}
              onClick={() => onSelectEmployee(emp)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
