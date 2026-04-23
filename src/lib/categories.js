import { apiRequest } from "./api";

function normalizeCategoriesResponse(response) {
  const payload = response?.data;

  const items = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  return items.map((category) => ({
    id: category.id,
    name: category.name || "فئة بدون اسم",
    slug: category.slug || "",
  }));
}

async function fetchCategories() {
  const response = await apiRequest("/categories", {
    skipAuth: true,
  });

  return normalizeCategoriesResponse(response);
}

export { fetchCategories, normalizeCategoriesResponse };