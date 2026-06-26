"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useWallet } from "@/components/providers/wallet-provider";
import { MobileNav } from "@/components/mobile-nav";
import {
  getNavigationGroupsForRole,
  getRoleExperience,
  type AppNavigationItem,
} from "@/components/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useWallet();
  const experience = getRoleExperience(role);
  const groups = getNavigationGroupsForRole(role);
  const RoleIcon = experience.icon;

  return (
    <>
      <aside className="glass-panel hidden w-[304px] flex-col rounded-[2.15rem] border border-white/65 p-5 lg:flex">
        <div className="orb-ring rounded-[1.75rem] bg-[linear-gradient(145deg,#071121,#102c55_52%,#0059c7)] px-5 py-6 text-white">
          <p className="display-eyebrow text-xs text-white/56">StudyBond workspace</p>
          <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold">
            <RoleIcon className="size-4 text-white/86" />
            {experience.label} mode
          </div>
          <h1 className="display-title mt-5 text-3xl font-semibold leading-tight">
            {experience.mission}
          </h1>
          <p className="mt-3 text-sm leading-7 text-white/72">{experience.summary}</p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-5">
          <NavSection
            items={groups.primary}
            pathname={pathname}
            title="Primary flow"
          />
          {groups.oversight.length > 0 ? (
            <NavSection
              items={groups.oversight}
              pathname={pathname}
              title="Oversight and evidence"
            />
          ) : null}
        </nav>

        <div className="rounded-[1.75rem] border border-border bg-white/70 p-4">
          <p className="display-eyebrow text-[11px] text-muted">Role tasks</p>
          <p className="mt-2 text-sm leading-7 text-foreground">{experience.menuHint}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {experience.focus.map((item) => (
              <span
                key={item}
                className="rounded-full border border-brand/12 bg-brand-soft/65 px-3 py-1 text-xs font-semibold text-brand-ink"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </aside>
      <MobileNav />
    </>
  );
}

function NavSection({
  items,
  pathname,
  title,
}: {
  items: AppNavigationItem[];
  pathname: string;
  title: string;
}) {
  return (
    <div>
      <p className="display-eyebrow px-2 text-[11px] text-muted">{title}</p>
      <div className="mt-3 flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={cn(
                "group flex items-center justify-between rounded-[1.35rem] px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-[linear-gradient(135deg,#081427,#0059c7)] text-white shadow-[0_18px_38px_rgba(0,89,199,0.24)]"
                  : "bg-transparent text-foreground/78 hover:bg-white/84 hover:text-foreground",
              )}
              href={item.href}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition",
                    active ? "bg-white/12 text-white" : "bg-brand-soft/72 text-brand",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                {item.label}
              </span>
              <span
                className={cn(
                  "size-2 rounded-full transition",
                  active ? "bg-accent" : "bg-transparent group-hover:bg-brand/18",
                )}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
