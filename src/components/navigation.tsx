import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  FileBadge,
  Files,
  House,
  MessageSquareQuote,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

export const appNavigation = [
  {
    href: "/dashboard",
    icon: BarChart3,
    label: "Dashboard",
    shortLabel: "Dash",
  },
  {
    href: "/bonds",
    icon: BriefcaseBusiness,
    label: "StudyBonds",
    shortLabel: "Bonds",
  },
  {
    href: "/bonds/new",
    icon: Files,
    label: "Create case",
    shortLabel: "Create",
  },
  {
    href: "/wallet-proofs",
    icon: WalletCards,
    label: "Wallet proofs",
    shortLabel: "Proofs",
  },
  {
    href: "/test-wallets",
    icon: House,
    label: "Test wallets",
    shortLabel: "Wallets",
  },
  {
    href: "/analytics",
    icon: ShieldCheck,
    label: "Analytics",
    shortLabel: "Track",
  },
  {
    href: "/feedback",
    icon: MessageSquareQuote,
    label: "Feedback",
    shortLabel: "Feedback",
  },
  {
    href: "/submission",
    icon: ClipboardList,
    label: "Submission",
    shortLabel: "Submit",
  },
  {
    href: "/",
    icon: FileBadge,
    label: "Landing",
    shortLabel: "Home",
  },
] as const;
