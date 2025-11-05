import { useState } from "react";

const LEADS_ENDPOINT = import.meta.env.VITE_LEADS_ENDPOINT as string;

export default function BrochureLeadBox({ project }: { project: any }) {
  const [lead, setLead] = useState({ name:"", email:"", mobile:"" });
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState<string | null>(null);

  async function submitLead(e: any) {
    e.preventDefault();
    setSending(true);
    try {
      const qs = new URLSearchParams(location.search);
      const res = await fetch(LEADS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
          project_id: project.project_id || project.id || "",
          project_name: project.project_name || project.title || "",
          slug: project.slug || "",
          brochure_url: project.brochure_url || "",
          ...lead,
          utm_source: qs.get("utm_source") || "",
          utm_medium: qs.get("utm_medium") || "",
          utm_campaign: qs.get("utm_campaign") || "",
          referrer: document.referrer,
          user_agent: navigator.userAgent
        })
      });
      const data = await res.json();
      setThanks("Thanks! Your brochure is ready.");
      if (data?.brochureUrl) window.location.href = data.brochureUrl;
    } catch {
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
        <form onSubmit={submitLead} className="flex flex-col gap-3">
          <input required placeholder="Full Name"
            className="border rounded-xl px-3 py-2"
            value={lead.name} onChange={e=>setLead({...lead, name:e.target.value})}/>
          <input required type="email" placeholder="Email"
            className="border rounded-xl px-3 py-2"
            value={lead.email} onChange={e=>setLead({...lead, email:e.target.value})}/>
          <input required pattern="^[6-9]\\d{9}$" placeholder="Mobile (10-digit India)"
            className="border rounded-xl px-3 py-2"
            value={lead.mobile} onChange={e=>setLead({...lead, mobile:e.target.value})}/>
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
