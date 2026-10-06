const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function api(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "We can't reach the server. Check your connection and try again.",
    );
  }

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    throw new Error(
      json?.error?.message || "Something went wrong. Please try again.",
    );
  }
  return json.data;
}
