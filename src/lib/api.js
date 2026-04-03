const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TOKEN_KEY = "topbid_access_token";
const UNAUTHORIZED_EVENT = "topbid:unauthorized";
const AUTH_NOTICE_KEY = "topbid_auth_notice";

function extractErrorMessage(data) {
  if (!data) {
    return "حدث خطأ أثناء الاتصال بالخادم";
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  if (Array.isArray(data.message) && data.message.length > 0) {
    return data.message[0];
  }

  if (data.errors && typeof data.errors === "object") {
    const firstErrorGroup = Object.values(data.errors)[0];

    if (Array.isArray(firstErrorGroup) && firstErrorGroup.length > 0) {
      return firstErrorGroup[0];
    }

    if (typeof firstErrorGroup === "string") {
      return firstErrorGroup;
    }
  }

  if (data.message && typeof data.message === "object") {
    const firstMessageGroup = Object.values(data.message)[0];

    if (Array.isArray(firstMessageGroup) && firstMessageGroup.length > 0) {
      return firstMessageGroup[0];
    }

    if (typeof firstMessageGroup === "string") {
      return firstMessageGroup;
    }
  }

  return "حدث خطأ أثناء الاتصال بالخادم";
}

function handleUnauthorized(message) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.setItem(
    AUTH_NOTICE_KEY,
    message || "انتهت صلاحية الجلسة أو أصبحت غير صالحة. سجل الدخول من جديد."
  );

  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));

  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    skipAuth = false,
  } = options;

  const token = localStorage.getItem(TOKEN_KEY);
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
    body:
      body === undefined
        ? undefined
        : isFormData
        ? body
        : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { message: text || "حدث رد غير متوقع من الخادم" };
  }

  const errorMessage = extractErrorMessage(data);

  if (response.status === 401 && !skipAuth) {
    handleUnauthorized(errorMessage);
    throw new Error(
      errorMessage || "انتهت صلاحية الجلسة. سجل الدخول من جديد."
    );
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return data;
}

export { apiRequest, API_BASE_URL, UNAUTHORIZED_EVENT, AUTH_NOTICE_KEY };