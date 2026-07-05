import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNowStrict, formatISO, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

import type {
  AnalyticsEventName,
  CaseStatus,
  UserRole,
  WalletProvider,
} from "@/types/study-bond";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(
  amount: number | string | bigint,
  assetCode = "XLM",
  maximumFractionDigits = 2,
) {
  const numeric = typeof amount === "bigint" ? Number(amount) : Number(amount);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(numeric).concat(` ${assetCode}`);
}

export function formatNumber(value: number | string | bigint) {
  const numeric = typeof value === "bigint" ? Number(value) : Number(value);
  return new Intl.NumberFormat("en-US").format(numeric);
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatRelativeDate(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function truncateAddress(address?: string | null, size = 4) {
  if (!address) {
    return "Unavailable";
  }

  return `${address.slice(0, size + 1)}...${address.slice(-size)}`;
}

export function statusTone(status: CaseStatus) {
  switch (status) {
    case "FUNDED":
    case "RELEASED":
    case "REFUNDED":
      return "success";
    case "REFUND_REQUESTED":
    case "VERIFICATION_PENDING":
    case "RELEASE_APPROVED":
      return "warning";
    case "DISPUTED":
    case "EXPIRED":
      return "danger";
    default:
      return "neutral";
  }
}

export function roleLabel(role: UserRole) {
  return role.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());
}

export function providerLabel(provider: WalletProvider) {
  if (provider !== "FREIGHTER" && provider !== "RABET") {
    return "User";
  }

  return provider.charAt(0).concat(provider.slice(1).toLowerCase());
}

export function eventLabel(event: AnalyticsEventName) {
  return event
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toIsoDate(value: Date) {
  return formatISO(value, { representation: "date" });
}

export function hashLike(value: string) {
  return slugify(value).slice(0, 43);
}
