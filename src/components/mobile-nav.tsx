"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getNavigationForRole } from "@/components/navigation";
import { useWallet } from "@/components/providers/wallet-provider";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { role } = useWallet();
  const mobileItems = getNavigationForRole(role).filter((item) => item.href !== "/");

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[1.9rem] border border-white/80 bg-white/88 p-2 shadow-[0_22px_60px_rgba(8,20,42,0.16)] backdrop-blur lg:hidden">
      <div className="flex gap-2 overflow-x-auto px-1 pb-1">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={cn(
                "flex min-w-[82px] flex-col items-center rounded-[1.35rem] px-3 py-3 text-[11px] font-semibold transition",
                active
                  ? "bg-[linear-gradient(135deg,#081427,#0059c7)] text-white"
                  : "bg-transparent text-muted",
              )}
              href={item.href}
            >
              <Icon className="mb-2 size-4" />
              {item.shortLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
