const BASE_URL = import.meta.env.VITE_API_URL;

const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
];

let onUnauthorized = () => {};

export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

// One request, no retry logic.
const request = async (path, { method = "GET", body } = {}) => {
  const options = { method, credentials: "include" };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(BASE_URL + path, options);
  } catch {
    const error = new Error("Can't reach the server");
    error.status = 0;
    throw error;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some responses have no body
  }

  if (!res.ok) {
    const error = new Error(data?.error || "Something went wrong");
    error.status = res.status;
    throw error;
  }
  return data;
};

// While a refresh is running, everyone who needs one gets the SAME promise.
// Your backend rotates refresh tokens (each works once), so two refreshes at
// the same time would make the second fail and log the user out by mistake.
let refreshPromise = null;

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = request("/auth/refresh", { method: "POST" })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export const api = async (path, options) => {
  try {
    return await request(path, options);
  } catch (error) {
    if (error.status !== 401 || NO_REFRESH_PATHS.includes(path)) {
      throw error;
    }

    const refreshed = await refreshSession();
    if (!refreshed) {
      onUnauthorized();
      throw error;
    }

    // Retry exactly once. A second 401 just throws, so it can never loop.
    return request(path, options);
  }
};
