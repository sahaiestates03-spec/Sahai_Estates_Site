// src/components/ContactForm.tsx
import { useState } from "react";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";

/**
 * Contact form that posts to the Apps Script webhook configured in VITE_LEADS_ENDPOINT
 * Sends form-encoded request to avoid preflight CORS.
 */

type FormState = {
  name: string;
  email: string;
  phone: string;
  propertyRequirements: string;
};

export default function ContactForm() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    propertyRequirements: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read endpoint from env (Vite)
  const ENDPOINT = (import.meta as any).env?.VITE_LEADS_ENDPOINT || "";

  const resetForm = () =>
    setFormData({
      name: "",
      email: "",
      phone: "",
      propertyRequirements: ""
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage(null);

    try {
      if (!ENDPOINT) throw new Error("Lead endpoint not configured (VITE_LEADS_ENDPOINT).");

      // Build form-encoded payload (avoid CORS preflight)
      const payload = new URLSearchParams();
      payload.set("project_id", "CONTACT-01");       // generic id for contact leads
      payload.set("project_name", "Contact Form");
      payload.set("slug", "contact-form");
      payload.set("name", formData.name || "");
      payload.set("email", formData.email || "");
      payload.set("mobile", formData.phone || "");
      payload.set("source", "contact-page");
      payload.set("brochure_url", "");               // not applicable here
      payload.set("utm_source", "");
      payload.set("utm_medium", "");
      payload.set("utm_campaign", "");
      payload.set("referrer", document.referrer || "");
      payload.set("user_agent", navigator.userAgent || "");
      // add propertyRequirements as a remark/map in utm_campaign (or you can add a custom key)
      payload.set("utm_campaign", formData.propertyRequirements || "");

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: payload.toString()
      });

      const txt = await res.text().catch(() => "");
      // the Apps Script returns JSON text with {result:"ok"|"error", message:"..."}
      let result = { result: "error", message: txt };
      try { result = JSON.parse(txt); } catch (err) { /* ignore */ }

      if (res.ok && result.result === "ok") {
        setSubmitStatus("success");
        resetForm();
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.message || `HTTP ${res.status}`);
      }
    } catch (err: any) {
      setSubmitStatus("error");
      setErrorMessage(String(err.message || err));
    } finally {
      setIsSubmitting(false);
      // reset status to idle after a short time so the message disappears
      setTimeout(() => setSubmitStatus("idle"), 4000);
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = "919920214015";
    const message = encodeURIComponent(
      "Hi, I am interested in your properties. Please contact me."
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy-900 mb-4">
            Get in <span className="text-brand-600">Touch</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready to find your dream property? Let's start a conversation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-navy-900 mb-6">Contact Information</h3>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="text-brand-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-1">Phone</h4>
                  <div className="space-y-1">
                    <a href="tel:+919920214015" className="text-gray-600 hover:text-brand-600 block">+91 99202 14015</a>
                    <a href="tel:+912223522092" className="text-gray-600 hover:text-brand-600 block">+91 022 2352 2092</a>
                    <a href="tel:+912223513703" className="text-gray-600 hover:text-brand-600 block">+91 022 2351 3703</a>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Mon-Sat, 10:00 AM - 7:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="text-brand-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-1">Email</h4>
                  <div className="space-y-1">
                    <a href="mailto:sahaiestates@yahoo.co.in" className="text-gray-600 hover:text-brand-600 block">sahaiestates@yahoo.co.in</a>
                    <a href="mailto:sahaiestates@gmail.com" className="text-gray-600 hover:text-brand-600 block">sahaiestates@gmail.com</a>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-brand-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-1">Office</h4>
                  <p className="text-gray-600">#131, 1st Floor, Arun Chamber,<br />Tardeo, Mumbai - 400034</p>
                  <p className="text-sm text-gray-500 mt-2">By appointment only</p>
                  <p className="text-xs text-gray-500 mt-1">RERA No: A51900001512</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-300"
            >
              <MessageCircle size={20} />
              Chat on WhatsApp
            </button>

            <div className="mt-8 bg-navy-900 text-white p-6 rounded-xl">
              <h4 className="font-bold text-lg mb-3">Working Hours</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Monday - Saturday:</span>
                  <span className="font-semibold">10:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Sunday:</span>
                  <span className="font-semibold">By Appointment</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-navy-900 mb-6">Send a Message</h3>

              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  Failed to send. {errorMessage ? errorMessage : "Please try again later."}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property Requirements</label>
                  <textarea
                    value={formData.propertyRequirements}
                    onChange={(e) => setFormData({ ...formData, propertyRequirements: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
                    placeholder="Tell me about your property requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-navy-900 hover:bg-brand-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : (<><Send size={20} /> Send Message</>)}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
