import React, { useState } from "react";
import { postLead } from "../utils/postLead";
import { getUtm } from "../utils/getUtm";

type ProjectMini = {
  project_id?: string;
  project_name?: string;
  slug?: string;
  brochure_url?: string;
};

type Message = { type: "success" | "error"; text: string } | null;

export default function BrochureLeadBox({ project }: { project: ProjectMini }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  // webhook - prefer env var in production, fallback to deployed Apps Script
  const webhook =
    (import.meta.env.VITE_LEADS_ENDPOINT as string) ||
    "https://script.google.com/macros/s/AKfycbxMIG4UIjlfKh2o7NXgFt40_fJxUma6nPIXw6PcE65ePv4eyGptv3ct6BDT8qjQAdlJbQ/exec";

  const sanitizeMobile = (s: string) => (s || "").replace(/\D/g, "");

  function validateMobile(m: string) {
    const m10 = sanitizeMobile(m).slice(-10);
    return /^[6-9]\d{9}$/.test(m10) ? m10 : null;
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setMessage(null);

    // Require name and (email or mobile)
    if (!name || (!email && !mobile)) {
      setMessage({ type: "error", text: "Please enter name and either email or mobile." });
      return;
    }

    // If mobile provided, check format
    let mobileSan = "";
    if (mobile) {
      const m = validateMobile(mobile);
      if (!m) {
        setMessage({
          type: "error",
          text: "Please enter a valid 10-digit Indian mobile number (starts with 6-9).",
        });
        return;
      }
      mobileSan = m;
    }

    setLoading(true);
    try {
      const payload = {
        project_id: project?.project_id || "",
        project_name: project?.project_name || project?.slug || "",
        slug: project?.slug || project?.project_name || "",
        name: name.trim(),
        email: (email || "").trim(),
        mobile: mobileSan,
        source: "website-newlaunch",
        brochure_url: project?.brochure_url || "",
        utm_source: getUtm("utm_source"),
        utm_medium: getUtm("utm_medium"),
        utm_campaign: getUtm("utm_campaign"),
        referrer: document.referrer || "",
        user_agent: navigator.userAgent || "",
      };

      const resp = await postLead(webhook, payload);

      // accept a few common success shapes
      if (resp && (resp.result === "ok" || resp.status === "ok")) {
        setMessage({ type: "success", text: "Thanks — brochure link opened / we will contact you shortly." });

        // open brochure if project has direct URL
        if (project?.brochure_url) {
          try {
            window.open(project.brochure_url, "_blank");
          } catch {}
        }

        // open any brochure URL returned by backend
        const possibleUrl = resp?.brochureUrl || resp?.brochure_url || resp?.url;
        if (possibleUrl) {
          try {
            window.open(possibleUrl, "_blank");
          } catch {}
        }

        // clear fields
        setName("");
        setEmail("");
        setMobile("");
      } else {
        setMessage({ type: "error", text: resp?.message || resp?.error || "Server error" });
      }
    } catch (err) {
      console.error("BrochureLeadBox error:", err);
      // friendly fallback — leads may still have been saved server-side
      setMessage({ type: "success", text: "Saved. We'll WhatsApp the brochure shortly." });
    } finally {
      setLoading(false);
    }
  }

  // quick submit helper for small CTA buttons
  const quickSubmit = () => handleSubmit();

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold mb-3">Get Brochure & Best Offers</h3>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Mobile (10-digit)"
          inputMode="numeric"
          maxLength={10}
          value={mobile}
          onChange={(e) => {
            const digits = sanitizeMobile(e.target.value).slice(0, 10);
            setMobile(digits);
            if (message && message.type === "error") setMessage(null);
          }}
        />

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 rounded bg-black text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Sending..." : "Download Brochure"}
          </button>

          <button type="button" onClick={quickSubmit} className="px-3 py-2 rounded border" disabled={loading}>
            Quick
          </button>
        </div>
      </form>

      {message ? (
        <div className={`mt-3 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </div>
      ) : null}

      <p className="text-xs text-gray-400 mt-3">By continuing you agree to be contacted by Sahai Estates.</p>
    </div>
  );
}
