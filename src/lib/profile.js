import { apiRequest } from "./api";

function toProfileFormValues(profile) {
  return {
    name: profile?.name || "",
    email: profile?.email || "",
    phone_number: profile?.phone_number || "",
    address: profile?.address || "",
    city: profile?.city || "",
    bio: profile?.bio || "",
  };
}

async function updateCurrentProfile(payload) {
  return apiRequest("/me", {
    method: "PUT",
    body: payload,
  });
}

async function changeCurrentPassword(payload) {
  return apiRequest("/me/password", {
    method: "PUT",
    body: payload,
  });
}

export { toProfileFormValues, updateCurrentProfile, changeCurrentPassword };