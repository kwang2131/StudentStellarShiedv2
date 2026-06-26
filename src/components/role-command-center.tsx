"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { getRoleExperience } from "@/components/navigation";
import { useWallet } from "@/components/providers/wallet-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RoleCommandCenter() {
  const { role, session } = useWallet();
  const experience = getRoleExperience(role);
  const RoleIcon = experience.icon;

  return (
    <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <article className="orb-ring rounded-[1.85rem] bg-[linear-gradient(145deg,#081427,#12305f_58%,#0059c7)] p-6 text-white shadow-[0_24px_64px_rgba(4,19,44,0.22)]">
        <p className="display-eyebrow text-xs text-white/56">Role mission board</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/12 text-white">
            <RoleIcon className="size-5" />
          </span>
          <div>
            <h2 className="display-title text-3xl font-semibold">{experience.label}</h2>
            <p className="mt-1 text-sm text-white/70">{experience.mission}</p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/76">{experience.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {experience.focus.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold text-white/88"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-[1.45rem] border border-white/12 bg-white/8 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="size-4 text-accent" />
            Session readiness
          </div>
          <p className="mt-2 text-sm leading-7 text-white/72">
            {session
              ? "A live wallet session is active. Use the action cards to move through the role-specific flow without bouncing across unrelated pages."
              : "No live wallet session is active yet. Start with onboarding so role-specific actions can lead into real Stellar wallet signing."}
          </p>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        {experience.actions.map((item, index) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className={cn(
                "surface-panel flex h-full flex-col rounded-[1.75rem] p-5",
                index === 0 && "border-brand/18 shadow-[0_18px_42px_rgba(0,89,199,0.12)]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </span>
                <span className="rounded-full border border-border bg-white/76 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {index === 0 ? "Priority" : `Action 0${index + 1}`}
                </span>
              </div>
              <h3 className="display-title mt-5 text-2xl font-semibold text-foreground">
                {item.label}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-muted">{item.description}</p>
              <div className="mt-6">
                <Link href={item.href}>
                  <Button className="w-full justify-between" variant={index === 0 ? "primary" : "secondary"}>
                    Open flow
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
