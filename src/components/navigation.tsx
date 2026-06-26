import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  ClipboardList,
  FileBadge,
  Files,
  GraduationCap,
  HandCoins,
  MessageSquareQuote,
  Orbit,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import type { UserRole } from "@/types/study-bond";

type NavigationGroup = "primary" | "oversight";

export interface AppNavigationItem {
  group: NavigationGroup;
  href: string;
  icon: LucideIcon;
  label: string;
  roles: UserRole[];
  shortLabel: string;
}

interface RoleExperience {
  actions: Array<{
    description: string;
    href: string;
    icon: LucideIcon;
    label: string;
  }>;
  focus: string[];
  icon: LucideIcon;
  label: string;
  menuHint: string;
  mission: string;
  summary: string;
}

const allRoles: UserRole[] = [
  "STUDENT",
  "PARENT_GUARDIAN",
  "INSTITUTION_VERIFIER",
  "AGENCY",
  "MEDIATOR",
  "ADMIN",
  "REVIEWER",
  "UNKNOWN",
];

export const appNavigation: AppNavigationItem[] = [
  {
    group: "primary",
    href: "/dashboard",
    icon: Orbit,
    label: "Mission control",
    roles: allRoles,
    shortLabel: "Control",
  },
  {
    group: "primary",
    href: "/bonds",
    icon: BriefcaseBusiness,
    label: "StudyBond cases",
    roles: allRoles,
    shortLabel: "Cases",
  },
  {
    group: "primary",
    href: "/bonds/new",
    icon: Files,
    label: "Create case",
    roles: ["STUDENT", "PARENT_GUARDIAN", "AGENCY", "ADMIN", "REVIEWER"],
    shortLabel: "Create",
  },
  {
    group: "primary",
    href: "/wallet-proofs",
    icon: WalletCards,
    label: "Wallet proofs",
    roles: [
      "STUDENT",
      "PARENT_GUARDIAN",
      "INSTITUTION_VERIFIER",
      "AGENCY",
      "MEDIATOR",
      "ADMIN",
      "REVIEWER",
    ],
    shortLabel: "Proofs",
  },
  {
    group: "oversight",
    href: "/analytics",
    icon: BarChart3,
    label: "Telemetry",
    roles: ["INSTITUTION_VERIFIER", "AGENCY", "MEDIATOR", "ADMIN", "REVIEWER"],
    shortLabel: "Metrics",
  },
  {
    group: "oversight",
    href: "/feedback",
    icon: MessageSquareQuote,
    label: "User feedback",
    roles: allRoles,
    shortLabel: "Feedback",
  },
  {
    group: "oversight",
    href: "/submission",
    icon: ClipboardList,
    label: "Submission deck",
    roles: ["INSTITUTION_VERIFIER", "MEDIATOR", "ADMIN", "REVIEWER"],
    shortLabel: "Review",
  },
  {
    group: "oversight",
    href: "/test-wallets",
    icon: ShieldCheck,
    label: "Test wallets",
    roles: ["INSTITUTION_VERIFIER", "AGENCY", "MEDIATOR", "ADMIN", "REVIEWER"],
    shortLabel: "Wallets",
  },
  {
    group: "oversight",
    href: "/",
    icon: FileBadge,
    label: "Public landing",
    roles: allRoles,
    shortLabel: "Home",
  },
];

const roleExperiences: Record<UserRole, RoleExperience> = {
  STUDENT: {
    actions: [
      {
        description: "Open a tuition, dorm, rental, or visa proof flow.",
        href: "/bonds/new",
        icon: Files,
        label: "Create your deposit case",
      },
      {
        description: "Confirm your wallet interactions and hashes were recorded.",
        href: "/wallet-proofs",
        icon: WalletCards,
        label: "Review wallet proof",
      },
      {
        description: "Log user-facing friction or trust gaps after each step.",
        href: "/feedback",
        icon: MessageSquareQuote,
        label: "Leave product feedback",
      },
    ],
    focus: [
      "Start a deposit case with the right destination",
      "Connect your live Stellar wallet for proof",
      "Upload evidence and track release or refund status",
    ],
    icon: GraduationCap,
    label: "Student",
    menuHint: "Creation, wallet proof, and case follow-up stay in the foreground.",
    mission: "Lock funds with a visible purpose and retain a clean proof trail.",
    summary:
      "Student mode focuses on creating a case, funding it, and keeping public-safe proof ready for schools, dorms, or visa flows.",
  },
  PARENT_GUARDIAN: {
    actions: [
      {
        description: "See whether student cases are funded, verified, or blocked.",
        href: "/bonds",
        icon: BriefcaseBusiness,
        label: "Monitor student cases",
      },
      {
        description: "Check the family wallet proof trail before any release decision.",
        href: "/wallet-proofs",
        icon: WalletCards,
        label: "Inspect wallet activity",
      },
      {
        description: "Capture feedback about clarity, trust, and payment confidence.",
        href: "/feedback",
        icon: MessageSquareQuote,
        label: "Share trust feedback",
      },
    ],
    focus: [
      "Fund on behalf of the student from a separate wallet",
      "Monitor contract state and release conditions",
      "Keep receipts and feedback aligned for family review",
    ],
    icon: HandCoins,
    label: "Parent / Guardian",
    menuHint: "Funding oversight and progress tracking become the primary path.",
    mission: "Back the student with traceable funding and clear release controls.",
    summary:
      "Parent mode prioritizes bond visibility, wallet evidence, and low-friction follow-up once the student has initiated the flow.",
  },
  INSTITUTION_VERIFIER: {
    actions: [
      {
        description: "Audit active cases before approving release or refund paths.",
        href: "/bonds",
        icon: BriefcaseBusiness,
        label: "Review active cases",
      },
      {
        description: "Check telemetry across onboarding, proofs, and contract events.",
        href: "/analytics",
        icon: BarChart3,
        label: "Watch operations telemetry",
      },
      {
        description: "Prepare the reviewer-facing submission evidence deck.",
        href: "/submission",
        icon: ClipboardList,
        label: "Open submission checklist",
      },
    ],
    focus: [
      "Review funding proof and case completeness",
      "Track operational metrics across active cases",
      "Prepare submission evidence and reviewer-ready artifacts",
    ],
    icon: BookOpenCheck,
    label: "Institution / Verifier",
    menuHint: "Operational telemetry and review surfaces replace creator shortcuts.",
    mission: "Validate each deposit path with enough data to approve or challenge release.",
    summary:
      "Verifier mode brings analytics, proof trails, and submission readiness closer so institutional reviewers can audit outcomes quickly.",
  },
  AGENCY: {
    actions: [
      {
        description: "Start another student funding case without leaving the workspace.",
        href: "/bonds/new",
        icon: Files,
        label: "Create a new cohort case",
      },
      {
        description: "Track throughput, wallet issues, and case progress across students.",
        href: "/analytics",
        icon: BarChart3,
        label: "Track cohort health",
      },
      {
        description: "Verify that every funded student has a clean wallet evidence trail.",
        href: "/wallet-proofs",
        icon: WalletCards,
        label: "Audit proof quality",
      },
    ],
    focus: [
      "Manage several student cases in parallel",
      "Move between creation, tracking, and analytics quickly",
      "Keep wallet proof quality consistent across cohorts",
    ],
    icon: BriefcaseBusiness,
    label: "Agency",
    menuHint: "Portfolio management and telemetry stay ahead of single-case views.",
    mission: "Operate a multi-student pipeline without losing proof quality.",
    summary:
      "Agency mode is tuned for throughput: create cases, monitor cohorts, and catch wallet or contract issues before they block a student.",
  },
  MEDIATOR: {
    actions: [
      {
        description: "Inspect case history and prepare for dispute resolution.",
        href: "/bonds",
        icon: BriefcaseBusiness,
        label: "Inspect disputed cases",
      },
      {
        description: "Validate wallet evidence before resolving ambiguous outcomes.",
        href: "/wallet-proofs",
        icon: WalletCards,
        label: "Verify wallet evidence",
      },
      {
        description: "Collect the final artifacts needed for reviewer handoff.",
        href: "/submission",
        icon: ClipboardList,
        label: "Prepare audit handoff",
      },
    ],
    focus: [
      "Inspect disputes and contract-side evidence",
      "Review wallet proofs before resolving edge cases",
      "Track readiness for reviewer submissions and audit handoff",
    ],
    icon: Scale,
    label: "Mediator",
    menuHint: "Dispute-facing oversight tools and reviewer artifacts move to the front.",
    mission: "Resolve ambiguous outcomes with an auditable decision path.",
    summary:
      "Mediator mode highlights oversight, telemetry, and submission views so dispute resolution stays grounded in observable chain activity.",
  },
  ADMIN: {
    actions: [
      {
        description: "Check overall telemetry and operating health in one place.",
        href: "/analytics",
        icon: BarChart3,
        label: "Inspect platform telemetry",
      },
      {
        description: "Review technical proof coverage and generated wallet rows.",
        href: "/wallet-proofs",
        icon: WalletCards,
        label: "Inspect proof coverage",
      },
      {
        description: "Open the reviewer checklist before shipping or demoing.",
        href: "/submission",
        icon: ClipboardList,
        label: "Review readiness",
      },
    ],
    focus: [
      "Inspect the whole operating surface",
      "Monitor proof coverage and telemetry drift",
      "Prepare deployment and reviewer artifacts",
    ],
    icon: ShieldCheck,
    label: "Admin",
    menuHint: "Every route stays visible for technical review and maintenance.",
    mission: "Keep the entire StudyBond surface stable for shipping and review.",
    summary:
      "Admin mode exposes the full internal workspace and is kept only as a safe fallback for technical operators.",
  },
  REVIEWER: {
    actions: [
      {
        description: "Start with the explicit submission and requirement checklist.",
        href: "/submission",
        icon: ClipboardList,
        label: "Open the checklist",
      },
      {
        description: "Inspect wallet proof rows and transaction evidence directly.",
        href: "/wallet-proofs",
        icon: WalletCards,
        label: "Inspect proof evidence",
      },
      {
        description: "Check telemetry and monitoring signals before scoring the project.",
        href: "/analytics",
        icon: BarChart3,
        label: "Review telemetry",
      },
    ],
    focus: [
      "Audit end-to-end product readiness",
      "Inspect contract, telemetry, and proof evidence",
      "Validate claims before submission",
    ],
    icon: ShieldCheck,
    label: "Reviewer",
    menuHint: "Read-heavy routes are prioritized for faster project evaluation.",
    mission: "Review whether the product claims are supported by real evidence.",
    summary:
      "Reviewer mode is optimized for reading proof, telemetry, and readiness pages without exposing creator-first shortcuts.",
  },
  UNKNOWN: {
    actions: [
      {
        description: "Start by picking a role and connecting the correct wallet.",
        href: "/onboarding",
        icon: Files,
        label: "Begin onboarding",
      },
      {
        description: "Understand the public value proposition before entering the app.",
        href: "/",
        icon: FileBadge,
        label: "Read the landing page",
      },
      {
        description: "Open the workspace once a role and wallet are selected.",
        href: "/dashboard",
        icon: Orbit,
        label: "Enter mission control",
      },
    ],
    focus: [
      "Choose a role to unlock the right workspace",
      "Connect a real wallet before taking action",
      "Use onboarding to anchor the next steps",
    ],
    icon: Orbit,
    label: "Workspace",
    menuHint: "Pick a role to reveal the correct operating flow.",
    mission: "Align the product surface with the actor using it.",
    summary:
      "Unknown mode is a safe fallback for fresh sessions before a user commits to a role.",
  },
};

export function getNavigationForRole(role: UserRole) {
  return appNavigation.filter((item) => item.roles.includes(role));
}

export function getNavigationGroupsForRole(role: UserRole) {
  const items = getNavigationForRole(role);

  return {
    oversight: items.filter((item) => item.group === "oversight"),
    primary: items.filter((item) => item.group === "primary"),
  };
}

export function getRoleExperience(role: UserRole) {
  return roleExperiences[role] ?? roleExperiences.UNKNOWN;
}
