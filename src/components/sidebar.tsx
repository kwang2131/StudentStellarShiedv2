"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileNav } from "@/components/mobile-nav";
import { appNavigation } from "@/components/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="glass-panel hidden w-72 flex-col rounded-[2rem] border border-white/60 p-5 lg:flex">
        <div className="rounded-[1.5rem] bg-foreground px-5 py-6 text-white">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/60">
            StudyBond
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Conditional deposit rail for international students.
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Testnet-only product surface for proof-of-funds, funding controls, and release governance.
          </p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-2">
          {appNavigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-brand text-white shadow-[0_18px_36px_rgba(15,109,140,0.22)]"
                    : "text-muted hover:bg-white/70 hover:text-foreground",
                )}
                href={item.href}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-[1.5rem] border border-border bg-white/60 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            Reviewer note
          </p>
          <p className="mt-2 text-sm text-foreground">
            Freighter and Rabet stay in the main flow. CLI-only utilities are isolated for technical validation and deployment tasks.
          </p>
        </div>
      </aside>
      <MobileNav />
    </>
  );
}
