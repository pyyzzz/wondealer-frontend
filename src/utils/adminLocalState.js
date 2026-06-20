const BAN_REASONS_KEY = "wondealerAdminBanReasons";
const DELETED_ITEMS_KEY = "wondealerAdminDeletedItems";

export const ADMIN_LOCAL_KEYS = [BAN_REASONS_KEY, DELETED_ITEMS_KEY];

const normalizeKey = (value) => String(value ?? "").trim().toLowerCase();

const readJson = (key, fallback) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getAdminBanReasons = () => readJson(BAN_REASONS_KEY, {});

export const getMemberIdentifiers = (member) =>
  [
    member?.memberId,
    member?.id,
    member?.userId,
    member?.email,
    member?.nickname,
    member?.username,
    member?.userName,
    member?.loginId,
    member?.identifier,
    member?.accountId,
    member?.name,
    member?.phone,
    member?.phoneNumber,
  ]
    .map(normalizeKey)
    .filter(Boolean);

export const saveAdminBanReason = (member, reason) => {
  const next = { ...getAdminBanReasons() };
  getMemberIdentifiers(member).forEach((key) => {
    next[key] = reason;
  });
  next.__latest__ = reason;
  writeJson(BAN_REASONS_KEY, next);
  return next;
};

export const removeAdminBanReason = (member) => {
  const next = { ...getAdminBanReasons() };
  getMemberIdentifiers(member).forEach((key) => {
    delete next[key];
  });
  writeJson(BAN_REASONS_KEY, next);
  return next;
};

export const getBanReasonForIdentifiers = (identifiers) => {
  const reasons = getAdminBanReasons();
  const key = identifiers.map(normalizeKey).find((value) => reasons[value]);
  return key ? reasons[key] : "";
};

export const getLatestBanReason = () => getAdminBanReasons().__latest__ || "";

export const decodeJwtPayload = (token) => {
  try {
    const payload = token?.split(".")?.[1];
    if (!payload) return {};
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
};

export const getBanReasonForAccount = (account = {}, token = "") => {
  const tokenPayload = decodeJwtPayload(token);
  const reasonFromAccount =
    account?.banReason || account?.reason || account?.suspendReason;
  const reasonFromLocal = getBanReasonForIdentifiers([
    account?.identifier,
    account?.memberId,
    account?.id,
    account?.userId,
    account?.email,
    account?.nickname,
    account?.username,
    account?.userName,
    account?.loginId,
    account?.accountId,
    account?.name,
    tokenPayload?.sub,
    tokenPayload?.email,
    tokenPayload?.nickname,
    tokenPayload?.username,
    tokenPayload?.loginId,
    tokenPayload?.memberId,
    tokenPayload?.userId,
  ]);
  return reasonFromAccount || reasonFromLocal;
};

export const isBannedAccount = (account = {}) => {
  const status = normalizeKey(account?.status).toUpperCase();
  return (
    account?.isBanned === true ||
    account?.banned === true ||
    status === "BANNED" ||
    status === "SUSPENDED" ||
    status.includes("BAN")
  );
};

export const isAdminMember = (member) => {
  const role = normalizeKey(member?.role ?? member?.authority);
  const email = normalizeKey(member?.email);
  return role === "role_admin" || email === "admin@wondealer.com";
};

export const memberMatchesSearch = (member, keyword) => {
  const q = normalizeKey(keyword);
  if (!q) return true;
  return getMemberIdentifiers(member).some((value) => value.includes(q));
};

export const getDeletedItemIds = () => readJson(DELETED_ITEMS_KEY, []);

export const saveDeletedItemId = (itemId) => {
  const id = normalizeKey(itemId);
  if (!id) return getDeletedItemIds();
  const next = Array.from(new Set([...getDeletedItemIds(), id]));
  writeJson(DELETED_ITEMS_KEY, next);
  return next;
};

export const isDeletedItem = (item, deletedIds = getDeletedItemIds()) => {
  const id = normalizeKey(item?.itemId ?? item?.id);
  const status = normalizeKey(item?.status);
  return (
    item?.deleted === true ||
    item?.isDeleted === true ||
    status === "deleted" ||
    status === "delete" ||
    status === "removed" ||
    deletedIds.includes(id)
  );
};

export const itemMatchesSearch = (item, keyword) => {
  const q = normalizeKey(keyword);
  if (!q) return true;
  return [
    item?.itemId,
    item?.id,
    item?.title,
    item?.name,
    item?.itemName,
    item?.seller,
    item?.sellerNickname,
  ]
    .map(normalizeKey)
    .some((value) => value.includes(q));
};
