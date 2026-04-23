import { apiRequest, API_BASE_URL } from "./api";

const FALLBACK_AUCTION_IMAGE =
  "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1000&q=80";

const BACKEND_BASE_URL = (API_BASE_URL || "").replace(/\/api\/?$/, "");

export function buildAuctionImageUrl(path) {
  if (!path) {
    return FALLBACK_AUCTION_IMAGE;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  return `${BACKEND_BASE_URL}/storage/${normalizedPath}`;
}

export function formatAuctionPrice(value) {
  const numericValue = Number(value ?? 0);

  if (Number.isNaN(numericValue)) {
    return "0";
  }

  return new Intl.NumberFormat("ar-EG").format(numericValue);
}

export function formatAuctionTimeLeft(expiresAt) {
  if (!expiresAt) {
    return "الوقت غير متوفر";
  }

  const targetTime = new Date(expiresAt).getTime();

  if (Number.isNaN(targetTime)) {
    return "الوقت غير متوفر";
  }

  const diff = targetTime - Date.now();

  if (diff <= 0) {
    return "انتهى المزاد";
  }

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} يوم ${hours} ساعة`;
  }

  if (hours > 0) {
    return `${hours} ساعة ${minutes} دقيقة`;
  }

  return `${minutes} دقيقة`;
}

export function normalizeAuction(auction) {
  return {
    id: auction.id,
    title: auction.title || "مزاد بدون عنوان",
    description: auction.description || "لا يوجد وصف لهذا المزاد حاليًا.",
    currentPrice: auction?.prices?.current ?? auction?.prices?.starting ?? 0,
    startingPrice: auction?.prices?.starting ?? 0,
    expiresAt: auction?.times?.expires_at || null,
    imageUrl: buildAuctionImageUrl(auction?.image?.path),
    categoryName: auction?.category?.name || "غير مصنفة",
    sellerName: auction?.seller?.name || "غير معروف",
    isActive: Boolean(auction?.status?.is_active),
  };
}

export function normalizeAuctionsResponse(response) {
  const payload = response?.data;

  const items = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  return items.map(normalizeAuction);
}

export async function fetchActiveAuctions() {
  const response = await apiRequest("/auctions", {
    skipAuth: true,
  });

  return normalizeAuctionsResponse(response);
}

function appendAuctionSpecs(formData, specs) {
  specs.forEach((spec, index) => {
    const key = spec.key.trim();
    const value = spec.value.trim();

    if (!key || !value) {
      return;
    }

    formData.append(`specs[${index}][key]`, key);
    formData.append(`specs[${index}][value]`, value);
  });
}

export async function createAuction(payload) {
  const formData = new FormData();

  formData.append("title", payload.title.trim());
  formData.append("description", payload.description.trim());
  formData.append("category_id", payload.categoryId);
  formData.append("starting_price", payload.startingPrice);
  formData.append("duration_hours", payload.durationHours);

  appendAuctionSpecs(formData, payload.specs || []);

  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  return apiRequest("/auctions", {
    method: "POST",
    body: formData,
  });
}