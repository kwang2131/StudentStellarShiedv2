"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appNavigation } from "@/components/navigation";
import { cn } from "@/lib/utils";

const mobileItems = appNavigation.filter((item) => item.href !== "/");

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[1.75rem] border border-white/80 bg-white/90 p-2 shadow-[0_22px_60px_rgba(15,30,50,0.16)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-2">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={cn(
                "flex flex-col items-center rounded-2xl px-2 py-3 text-[11px] font-semibold transition",
                active ? "bg-brand text-white" : "text-muted",
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
