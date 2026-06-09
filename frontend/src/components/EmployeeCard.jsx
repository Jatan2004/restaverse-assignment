import { useState, useRef } from "react";
import { ChevronRight, Mail, Calendar, Copy, Check, User } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { getAvatarColors } from "../lib/utils";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent } from "./ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function initials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
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

export default function EmployeeCard({ employee, highlight, onClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ten = tenure(employee.date_of_joining);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    cardRef.current.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const handleCardClick = () => {
    setIsOpen(!isOpen);
  };

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(employee.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewProfile = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        ref={cardRef}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && handleCardClick()}
        onMouseMove={handleMouseMove}
        className="spotlight border border-border dark:border-zinc-800 bg-card text-card-foreground hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 cursor-pointer group transition-all duration-300 select-none hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 rounded-2xl relative"
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Avatar className={`w-12 h-12 rounded-xl shadow-sm border border-border/80 dark:border-zinc-800 ${getAvatarColors(employee.department).bg}`}>
              <AvatarFallback
                className={`w-full h-full rounded-none flex items-center justify-center font-bold text-base bg-transparent select-none ${getAvatarColors(employee.department).text}`}
              >
                {initials(employee.name)}
              </AvatarFallback>
            </Avatar>

            {/* Tenure Badge */}
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold flex items-center gap-1 border border-border rounded-lg ${ten === "New Hire" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "text-muted-foreground"
                }`}
            >
              {ten === "New Hire" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {ten}
            </Badge>
          </div>

          {/* Name */}
          <h3 className="font-bold text-zinc-900 dark:text-white tracking-tight mb-0.5 text-base">
            <Highlight text={employee.name} q={highlight} />
          </h3>

          {/* Designation */}
          <p className="text-sm text-muted-foreground mb-4 font-medium">
            <Highlight text={employee.designation} q={highlight} />
          </p>

          {/* Department Badge */}
          <Badge
            className="text-[11px] px-2.5 py-0.5 rounded-lg border border-border bg-secondary hover:bg-secondary text-secondary-foreground font-semibold tracking-wide"
          >
            {employee.department}
          </Badge>

          {/* Collapsible Content Section */}
          <CollapsibleContent className="collapsible-content">
            <div className="border-t border-border dark:border-zinc-800/60 mt-4 pt-4 flex flex-col gap-3.5">
              {/* Detailed specs */}
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <a
                  href={`mailto:${employee.email}`}
                  onClick={e => e.stopPropagation()}
                  className="hover:underline hover:text-primary font-medium truncate"
                >
                  {employee.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-medium">
                  Joined {new Date(employee.date_of_joining).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyEmail}
                      className="rounded-xl h-8 text-[11px] font-bold border-border text-foreground hover:bg-muted"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500 mr-1 shrink-0" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-400 mr-1 shrink-0" /> Copy Email
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy email address</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={handleViewProfile}
                      className="rounded-xl h-8 text-[11px] font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      <User className="w-3 h-3 mr-1 shrink-0" /> Full Profile
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View detailed profile</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-6 py-4 border-t border-border dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-muted-foreground truncate font-medium">
              {isOpen ? "Click to collapse details" : "Click to view quick contact"}
            </span>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0 transition-all duration-300 ${isOpen ? "rotate-90 text-primary" : "group-hover:translate-x-1 group-hover:text-primary"
              }`}
          />
        </CardFooter>
      </Card>
    </Collapsible>
  );
}
