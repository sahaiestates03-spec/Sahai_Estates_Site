import { useState } from "react";

/**
 * LeadCaptureForm.tsx
 * - Small lightweight lead capture used on property pages / new launch pages.
 * - Uses VITE_LEADS_ENDPOINT if set, otherwise uses a fallback exec URL.
 */

type Props = {
  projectName: string;
  projectId?: string;
  slug?: string;
  brochureUrl?: string;
  onDone?: () => void;
};

const FALLBACK_EXEC = "https://script.google.com/macros/s/AKfycbxyWsideQk_iuOM-GnOPxYGOSlBJ0-8cFGy5vzoMEgk2lc4z4To5IQOF_apXcWOg-dy3A/exec";
const WEBHOOK = (import.meta as any)?.env?.VITE_LEADS_ENDPOINT?.toString().trim() || FALLBACK_EXEC;

export default function LeadCaptureForm({ projectName, projectId = "", slug = "", brochureUrl = "", onDone }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle"|"sending"|"done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!WEBHOOK) { alert("Webhook not set"); return; }
    setStatus("sending");
    try {
      const payload: Record<string,string> = {
        project_id: projectId || "",
        project_name: projectName || "",
        slug: slug || "",
        name: form.name || "",
        email: form.email || "",
        mobile: form.phone || "",
        source: "New Launch Page",
        brochure_url: brochureUrl || "",
        utm_source: new URLSearchParams(window.location.search).get("utm_source") || "",
        utm_medium: new URLSearchParams(window.location.search).get("utm_medium") || "",
        utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || "",
        referrer: typeof document !== "undefined" ? document.referrer || "" : "",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent || "" : ""
      };

      const body = new URLSearchParams(payload).toString();

      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });

      // Apps Script typically returns JSON; read and check
      let json: any = null;
      try { json = await res.json(); } catch {}
      // Many scripts return { result: "ok" } or { result: "success" }
      const ok = (json && (json.result === "ok" || json.result === "success")) || res.ok;
      if (!ok) throw new Error(json?.message || "Submission failed");

      setStatus("done");
      if (brochureUrl) {
        window.open(brochureUrl, "_blank");
      }
      if (onDone) onDone();
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className="w-full border rounded-lg px-3 py-2" placeholder="Full Name" required value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
      <input className="w-full border rounded-lg px-3 py-2" placeholder="Email" type="email" required value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
      <input className="w-full border rounded-lg px-3 py-2" placeholder="Mobile (10 digits)" pattern="[0-9]{10}" required value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})}/>
      <button type="submit" disabled={status!=="idle"} className="w-full bg-black text-white rounded-lg py-2 font-semibold">
        {status==="sending" ? "Submitting..." : "Download Brochure"}
      </button>
      {status==="done" && <p className="text-green-600 text-sm">Thanks — brochure opened and lead saved.</p>}
    </form>
  );
}
