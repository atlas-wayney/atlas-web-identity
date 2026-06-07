export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";
export const IDENTITY_API_BASE = process.env.NEXT_PUBLIC_IDENTITY_API_BASE || "http://localhost:8001";

// Badge style classes for Tailwind
export const BADGE_BASE_CLASS = "px-2 py-0.5 rounded text-md font-medium";

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-600",
  DCOPS: "bg-teal-100 text-teal-600",
  EDITOR: "bg-amber-100 text-yellow-600",
  VIEWER: "bg-indigo-100 text-indigo-600",
};

export const APP_COLORS: Record<string, string> = {
  ATLAS_APP_IDENTITY: "bg-blue-100 text-blue-600",
  ATLAS_APP_NETWORK: "bg-green-100 text-green-600",
  ATLAS_APP_BILLING: "bg-purple-100 text-purple-600",
};

export const DEFAULT_COLOR = "bg-gray-100 text-gray-500";
export const INTERNAL_COLOR = "bg-blue-100 text-blue-600";
export const DOMAIN_COLOR = "bg-indigo-100 text-indigo-700";
export const TAG_COLOR = "bg-amber-100 text-yellow-600";
export const GROUP_COLOR = "bg-indigo-100 text-indigo-700";
