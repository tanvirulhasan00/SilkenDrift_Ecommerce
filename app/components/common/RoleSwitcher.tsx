import React from "react";
import { useAuth } from "~/hooks/useAuth";
import { UserRole } from "~/types";
import { ShieldCheck, User, Sparkles, ShieldAlert } from "lucide-react";
import { cn } from "~/lib/utils";

export const RoleSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { user, role, isDemo, loginDemo } = useAuth();

  const roles: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: "customer", label: "Customer", icon: <User className="w-3.5 h-3.5" /> },
    { id: "manager", label: "Manager", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "admin", label: "Admin", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border border-silk-300/80 bg-silk-100/70 p-1 text-xs dark:border-dark-border dark:bg-dark-elevated",
        className
      )}
    >
      {!isDemo ? (
        <div className="flex items-center gap-1.5 px-2 py-0.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
            Real {role}:
          </span>
          <span className="text-[11px] font-semibold text-silk-900 dark:text-silk-100 truncate max-w-[100px]">
            {user?.displayName?.split(" ")[0] || user?.email}
          </span>
          <button
            type="button"
            onClick={() => loginDemo("customer")}
            className="ml-1 text-[9px] underline text-amber-700 hover:text-amber-900 dark:text-amber-400 font-semibold"
            title="Switch to Demo Sandbox Mode"
          >
            (Demo Mode)
          </button>
        </div>
      ) : (
        <>
          <span className="text-[10px] uppercase font-extrabold text-silk-800 px-1 dark:text-silk-300 flex items-center gap-1">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>Demo:</span>
          </span>
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => loginDemo(r.id)}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-0.5 font-medium transition",
                role === r.id && isDemo
                  ? "bg-silk-950 text-gold-300 border border-gold-500/60 shadow-sm dark:bg-gold-500 dark:text-silk-950 dark:border-gold-400 font-bold"
                  : "text-silk-700 hover:text-silk-950 hover:bg-silk-200/80 dark:text-silk-300 dark:hover:text-gold-400 dark:hover:bg-dark-border"
              )}
            >
              {r.icon}
              <span className="capitalize">{r.label}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );
};
