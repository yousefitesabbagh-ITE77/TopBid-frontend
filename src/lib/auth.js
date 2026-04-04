import { apiRequest } from "./api";

const TOKEN_KEY = "topbid_access_token";

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function extractToken(payload) {
  return (
    payload?.data?.access_token ||
    payload?.access_token ||
    payload?.token ||
    null
  );
}

function extractUser(payload) {
  return payload?.data?.user || payload?.user || payload?.data || null;
}

async function loginUser(credentials) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
    skipAuth: true,
  });

  const token = extractToken(response);

  if (!token) {
    throw new Error("لم يتم إرجاع access token من الباك");
  }

  saveToken(token);

  return {
    response,
    token,
    user: extractUser(response),
  };
}

async function registerUser(payload) {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: payload,
    skipAuth: true,
  });

  return {
    response,
    token: null,
    user: null,
  };
}

async function verifyOtpUser(payload) {
  const response = await apiRequest("/auth/verify-otp", {
    method: "POST",
    body: payload,
    skipAuth: true,
  });

  const token = extractToken(response);

  if (!token) {
    throw new Error("لم يتم إرجاع access token بعد التحقق من OTP");
  }

  saveToken(token);

  return {
    response,
    token,
    user: extractUser(response),
  };
}

async function resendOtpCode(email) {
  return apiRequest("/auth/resend-otp", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

async function fetchMe() {
  const response = await apiRequest("/me");
  return extractUser(response);
}

async function logoutUser() {
  try {
    await apiRequest("/auth/logout", {
      method: "DELETE",
    });
  } finally {
    clearToken();
  }
}

export {
  TOKEN_KEY,
  saveToken,
  getStoredToken,
  clearToken,
  loginUser,
  registerUser,
  verifyOtpUser,
  resendOtpCode,
  fetchMe,
  logoutUser,
};