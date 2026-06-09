import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const DEPARTMENTS = ["Engineering", "Marketing", "Human Resources", "Finance", "Sales", "Operations"];
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  department: z.string().min(1, "Please select a department."),
  designation: z.string().min(2, "Designation must be at least 2 characters."),
  date_of_joining: z.string().min(1, "Date is required."),
});

export default function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "Engineering",
      designation: "",
      date_of_joining: new Date().toISOString().split("T")[0]
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server responded with ${response.status}`);
      }

      const newEmp = await response.json();
      setSuccess(true);
      form.reset();
      
      // Notify parent to refetch
      if (onEmployeeAdded) {
        onEmployeeAdded(newEmp);
      }

      // Close modal after a short delay
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!open) {
      form.reset();
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Add New Employee
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            Create a new employee record. Fill in all details below.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive text-xs rounded-xl border border-destructive/20 my-1 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Failed to add employee:</span>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-emerald-500/10 text-emerald-500 text-xs rounded-xl border border-emerald-500/20 my-1 animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Success!</span>
              <p className="mt-0.5">Employee record added successfully.</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="pt-2 -mx-4 -mb-4 flex flex-col">
            <div className="space-y-4 px-4 pb-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" disabled={loading || success} className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. john.doe@company.com" disabled={loading || success} className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Department</FormLabel>
                    <Select disabled={loading || success} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_joining"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Joining Date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={loading || success} className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Job Title / Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Senior Software Engineer" disabled={loading || success} className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            </div>

            <DialogFooter className="mx-0 mb-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading || success}
                className="rounded-xl border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || success}
                className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 flex items-center gap-1.5 font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
