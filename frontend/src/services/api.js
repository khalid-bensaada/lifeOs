import { MESSAGES, tr } from "../i18n";

const BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:4000/api");

const messageOf = (error) => {
  const key = error?.code ? `error.${error.code}` : null;
  if (key && MESSAGES.en[key]) return tr(key, error.params);
  return error?.message || tr("error.generic");
};

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
    throw new Error(tr("error.network"));
  }

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    throw new Error(messageOf(json?.error));
  }
  return json.data;
}
