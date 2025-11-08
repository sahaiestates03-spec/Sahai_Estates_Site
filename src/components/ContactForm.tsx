import { useState } from "react";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";

/**
 * Contact form that posts leads in the same format your Apps Script expects.
 * - uses VITE_LEADS_ENDPOINT env var (set in .env / Vercel)
 * - sends application/x-www-form-urlencoded
 * - fields written to sheet: project_id, project_name, slug, name, email, mobile, source, brochure_url, utm_*, referrer, user_agent
 */

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    propertyRequirements: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  // helper to safely read query params (utm)
  const getQueryParam = (key: string) =>
    new URLSearchParams(window.location.search).get(key) || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // build payload keys that Apps Script expects
      const payload = new URLSearchParams({
        // project fields empty for contact form (no specific project)
        project_id: "",
        project_name: "",
        slug: "",

        // user fields
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.phone.trim(),

        // source & brochure
        source: "contact-page",
        brochure_url: "",

        // UTM parameters if present
        utm_source: getQueryParam("utm_source"),
        utm_medium: getQueryParam("utm_medium"),
        utm_campaign: getQueryParam("utm_campaign"),

        // referrer & user agent
        referrer: document.referrer || "",
        user_agent: navigator.userAgent || "",

        // optional: include the message field so you can inspect it in Apps Script if needed
        message: formData.propertyRequirements.trim(),
      });

      // endpoint from env (Vite exposes VITE_* variables)
      const endpoint =
        (import.meta.env as any).VITE_LEADS_ENDPOINT ||
        "https://script.google.com/macros/s/YOUR_DEPLOY/exec";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: payload.toString(),
        // note: using Apps Script with "anyone" deployment avoids CORS issues
      });

      // read text (Apps Script returns JSON text)
      const text = await res.text();

      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", phone: "", propertyRequirements: "" });
      } else {
        console.error("Lead submit failed", res.status, text);
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Network error sending lead", err);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      // reset status to idle after a short time
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = "919920214015";
    const message = encodeURIComponent(
      "Hi, I am interested in learning more about your luxury properties in South Mumbai."
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
                    <a href="tel:+919920214015" className="text-gray-600 hover:text-brand-600 block">
                      +91 99202 14015
                    </a>
                    <a href="tel:+912223522092" className="text-gray-600 hover:text-brand-600 block">
                      +91 022 2352 2092
                    </a>
                    <a href="tel:+912223513703" className="text-gray-600 hover:text-brand-600 block">
                      +91 022 2351 3703
                    </a>
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
                    <a href="mailto:sahaiestates@yahoo.co.in" className="text-gray-600 hover:text-brand-600 block">
                      sahaiestates@yahoo.co.in
                    </a>
                    <a href="mailto:sahaiestates@gmail.com" className="text-gray-600 hover:text-brand-600 block">
                      sahaiestates@gmail.com
                    </a>
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
                  <p className="text-gray-600">
                    #131, 1st Floor, Arun Chamber,
                    <br />
                    Tardeo, Mumbai - 400034
                  </p>
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
                  Oops — there was a problem sending your message. Please try again or call us.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    id="contact_name"
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
                    id="contact_email"
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
                    id="contact_phone"
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
                    id="contact_message"
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
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
