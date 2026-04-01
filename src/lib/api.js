const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    skipAuth = false,
  } = options;

  const token = localStorage.getItem("topbid_access_token");
  const isFormData = body instanceof FormData;

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (!isFormData && body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (!skipAuth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { message: text || "حدث رد غير متوقع من الخادم" };
  }

  if (!response.ok) {
    throw new Error(data.message || "حدث خطأ أثناء الاتصال بالخادم");
  }

  return data;
}

export { apiRequest, API_BASE_URL };