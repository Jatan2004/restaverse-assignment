/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { X, Mail, Calendar, Building2, User, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { getAvatarColors } from "../lib/utils";

function initials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(str) {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });
}

function tenure(str) {
  const d = new Date(str);
  const n = new Date();
  let y = n.getFullYear() - d.getFullYear();
  let m = n.getMonth() - d.getMonth();
  if (m < 0) { y--; m += 12; }
  const parts = [];
  if (y > 0) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} mo`);
  return parts.length ? parts.join(" ") : "New Hire";
}

export default function ProfileDrawer({ employee, onClose }) {
  const [active, setActive] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (employee) {
      setActive(employee);
    }
  }, [employee]);

  const copy = () => {
    if (!active) return;
    navigator.clipboard.writeText(active.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ten = active ? tenure(active.date_of_joining) : "";
  const date = active ? formatDate(active.date_of_joining) : "";

  return (
    <Dialog open={!!employee} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 w-full sm:max-w-[400px] flex flex-col gap-0 border border-border/40 dark:border-zinc-800 bg-card overflow-hidden max-h-[85vh] sm:rounded-2xl">
        {active && (
          <ScrollArea className="h-full max-h-[85vh]">
            <div className="flex flex-col bg-background relative">
              {/* Header / Hero Section */}
              <div className="px-6 pt-8 pb-6 shrink-0 border-b border-border/40 relative flex flex-col items-center text-center">
                <Avatar
                  className={`w-20 h-20 rounded-full mb-4 select-none ${getAvatarColors(active.department).bg}`}
                >
                  <AvatarFallback
                    className={`bg-transparent font-extrabold text-2xl flex items-center justify-center ${getAvatarColors(active.department).text}`}
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {initials(active.name)}
                  </AvatarFallback>
                </Avatar>

                <DialogTitle className="text-foreground font-black text-2xl leading-none tracking-tight border-none p-0 mt-0">
                  {active.name}
                </DialogTitle>
                <p className="text-muted-foreground text-sm mt-1.5 font-medium">
                  {active.designation}
                </p>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-muted text-foreground">
                    {active.department}
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {ten}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-6 flex flex-col gap-6">
                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`mailto:${active.email}`}
                    className="flex items-center justify-center gap-2 h-10 rounded-full text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-bold transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                  <Button
                    onClick={copy}
                    variant="outline"
                    className="flex items-center justify-center gap-2 h-10 rounded-full border border-border/60 bg-transparent text-foreground hover:bg-muted font-bold text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Copy Email
                      </>
                    )}
                  </Button>
                </div>

                {/* Details List */}
                <div className="flex flex-col gap-4">
                  {[
                    { Icon: Mail, label: "Email", value: active.email },
                    { Icon: Building2, label: "Department", value: active.department },
                    { Icon: User, label: "Role", value: active.designation },
                    { Icon: Calendar, label: "Date Joined", value: date },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-zinc-400 group-hover:text-foreground transition-colors shrink-0">
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
