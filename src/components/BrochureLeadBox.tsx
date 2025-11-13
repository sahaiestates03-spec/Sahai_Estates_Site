import React, { useState } from "react";
import { getUtm } from "../utils/getUtm";
import submitLeadHiddenForm from "../utils/submitLeadHiddenForm";

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

  // Use Vite env var (safe check so it won't throw in non-built environments)
  const LEADS_ENDPOINT =
    (typeof import !== "undefined" &&
      typeof (import as any).meta !== "undefined" &&
      (import as any).meta.env?.VITE_LEADS_ENDPOINT) ||
    // Optional fallback (only used if env not set) — replace with your exec if you want
    "https://script.google.com/macros/s/AKfycbwSxgTY6RjhwkCL6WSZT1PdJQB6U6QHGoQE0s9XF7kJtKeLeMHHzla5XRYBXOf7X-2j8g/exec";

  const sanitizeMobile = (s: string) => (s || "").replace(/\D/g, "");

  function validateMobile(s: string) {
    const digits = sanitizeMobile(s);
    if (digits.length < 10) return null;
    const m10 = digits.slice(-10);
    return /^[6-9]\d{9}$/.test(m10) ? m10 : null;
  }

  function openInNewTab(url?: string) {
    if (!url) return;
    try {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      try {
        window.open(url, "_blank");
        if ((window as any).opener) (window as any).opener = null;
      } catch {}
    }
  }

  async function onGetBrochureClick(proj: ProjectMini) {
    const payload = {
      project_id: proj.project_id || proj.slug || "",
      project_name: proj.project_name || proj.slug || "",
      slug: proj.slug || "",
      name: "",
      email: "",
      mobile: "",
      source: "brochure-download",
      brochure_url: proj.brochure_url || "",
      utm_source: getUtm("utm_source"),
      utm_medium: getUtm("utm_medium"),
      utm_campaign: getUtm("utm_campaign"),
      referrer: typeof document !== "undefined" ? document.referrer || "" : "",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent || "" : "",
      notes: "",
    };

    setLoading(true);
    setMessage(null);
    try {
      await submitLeadHiddenForm(LEADS_ENDPOINT, payload);
      if (proj.brochure_url) openInNewTab(proj.brochure_url);
      setMessage({ type: "success", text: "Saved. We'll WhatsApp the brochure shortly." });
    } catch (err) {
      console.error("Brochure lead submit failed", err);
      setMessage({ type: "error", text: "Could not save lead. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setMessage(null);

    if (!name || (!email && !mobile)) {
      setMessage({ type: "error", text: "Please enter name and either email or mobile." });
      return;
    }

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
        referrer: typeof document !== "undefined" ? document.referrer || "" : "",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent || "" : "",
      };

      await submitLeadHiddenForm(LEADS_ENDPOINT, payload);

      setMessage({ type: "success", text: "Thanks — we'll contact you shortly." });

      if (project?.brochure_url) {
        openInNewTab(project.brochure_url);
      }

      setName("");
      setEmail("");
      setMobile("");
    } catch (err) {
      console.error("BrochureLeadBox error:", err);
      setMessage({ type: "error", text: "Could not save lead. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const quickSubmit = () => onGetBrochureClick(project);

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
          aria-label="Full name"
        />

        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
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
          aria-label="Mobile number"
        />

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 rounded bg-black text-white font-semibold disabled:opacity-50"
            aria-disabled={loading}
          >
            {loading ? "Sending..." : "Download Brochure"}
          </button>

          <button
            type="button"
            onClick={quickSubmit}
            className="px-3 py-2 rounded border"
            disabled={loading}
            aria-disabled={loading}
          >
            Quick
          </button>
        </div>
      </form>

      {message ? (
        <div className={`mt-3 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`} aria-live="polite">
          {message.text}
        </div>
      ) : null}

      <p className="text-xs text-gray-400 mt-3">By continuing you agree to be contacted by Sahai Estates.</p>
    </div>
  );
}
