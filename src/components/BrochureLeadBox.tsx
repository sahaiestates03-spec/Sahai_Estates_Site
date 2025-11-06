// src/components/BrochureLeadBox.tsx
import { useState } from "react";

const LEADS_ENDPOINT = import.meta.env.VITE_LEADS_ENDPOINT as string;

export default function BrochureLeadBox({ project }: { project: any }) {
  const [lead, setLead] = useState({ name: "", email: "", mobile: "" });
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sanitizeMobile = (s: string) => {
    // keep only digits
    return (s || "").replace(/\D/g, "");
  };

  async function submitLead(e: any) {
    e.preventDefault();
    setError(null);

    // sanitize and validate before sending
    const mobileSan = sanitizeMobile(lead.mobile).slice(-10); // last 10 digits
    if (!/^[6-9]\d{9}$/.test(mobileSan)) {
      setError("Please enter a valid 10-digit Indian mobile number (starts with 6-9).");
      return;
    }

    setSending(true);
    try {
      const qs = new URLSearchParams(location.search);
      const payload = {
        project_id: project.project_id || project.id || "",
        project_name: project.project_name || project.title || "",
        slug: project.slug || "",
        brochure_url: project.brochure_url || "",
        // send trimmed name/email and sanitized mobile
        name: (lead.name || "").trim(),
        email: (lead.email || "").trim(),
        mobile: mobileSan,
        utm_source: qs.get("utm_source") || "",
        utm_medium: qs.get("utm_medium") || "",
        utm_campaign: qs.get("utm_campaign") || "",
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      };

      const res = await fetch(LEADS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setThanks("Thanks! Your brochure is ready.");
      // redirect to brochure if backend returns a URL
      if (data?.brochureUrl) window.location.href = data.brochureUrl;
    } catch (err) {
      console.error(err);
      setThanks("Saved. We’ll WhatsApp the brochure shortly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="sticky top-24 border rounded-2xl p-5 shadow bg-white/70 backdrop-blur" id="brochure">
      <div className="text-lg font-semibold mb-3">Get Brochure & Best Offers</div>
      {thanks ? (
        <div className="text-green-700">{thanks}</div>
      ) : (
        <form onSubmit={submitLead} className="flex flex-col gap-3" noValidate>
          <input
            required
            placeholder="Full Name"
            className="border rounded-xl px-3 py-2"
            value={lead.name}
            onChange={(e) => setLead({ ...lead, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="border rounded-xl px-3 py-2"
            value={lead.email}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
          />
          <input
            required
            // keep pattern as a hint for browsers, but we sanitize onChange and validate onSubmit
            pattern="^[6-9]\d{9}$"
            placeholder="Mobile (10-digit India)"
            className="border rounded-xl px-3 py-2"
            inputMode="numeric"
            maxLength={10}
            value={lead.mobile}
            onChange={(e) => {
              // sanitize input immediately: keep digits only, up to 10 characters
              const digits = sanitizeMobile(e.target.value).slice(0, 10);
              setLead({ ...lead, mobile: digits });
              if (error) setError(null);
            }}
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button disabled={sending} className="rounded-xl bg-black text-white py-2">
            {sending ? "Please wait…" : "Download Brochure"}
          </button>
          <div className="text-xs text-gray-500">
            By continuing you agree to be contacted by Sahai Estates.
          </div>
        </form>
      )}
    </div>
  );
}
