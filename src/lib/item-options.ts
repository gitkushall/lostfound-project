export const ITEM_CATEGORIES = [
  "Keys",
  "Wallet / ID",
  "Phone",
  "Electronics",
  "Bag / Backpack",
  "Clothing",
  "Books",
  "Other",
] as const;

export const ITEM_STATUSES = [
  "OPEN",
  "CLAIM_PENDING",
  "CLAIMED",
  "RETURNED",
] as const;

export const ITEM_TYPES = ["LOST", "FOUND"] as const;

export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  OPEN: "Open",
  CLAIM_PENDING: "Claim Pending",
  CLAIMED: "Claimed",
  RETURNED: "Returned",
};
