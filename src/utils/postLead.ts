// src/utils/postLead.ts
export async function postLead(webhookUrl: string, payload: Record<string, any>) {
  // Build URL-encoded string (avoids CORS preflight)
  const params = new URLSearchParams();
  for (const k in payload) {
    if (payload[k] == null) continue;
    params.append(k, String(payload[k]));
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { result: "error", message: "invalid json from server", raw: text };
  }
}
