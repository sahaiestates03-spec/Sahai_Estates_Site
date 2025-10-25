import { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { WORKING_HOURS, CONTACT } from '@/config/site'; // adjust path alias if needed

export default function ContactForm() {
  // ... your state code stays the same

  const handleWhatsApp = () => {
    const url = `https://wa.me/${CONTACT.whatsappNumberIntl}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      {/* ... */}

      <div className="space-y-6 mb-8">
        {/* Phone box */}
        <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
          <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="text-brand-600" size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-navy-900 mb-1">Phone</h4>
            <div className="space-y-1">
              {CONTACT.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s+/g, '')}`} className="text-gray-600 hover:text-brand-600 block">
                  {p}
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">{CONTACT.phoneAvailability}</p>
          </div>
        </div>

        {/* Email + Address boxes use CONTACT.emails, CONTACT.addressLine1 etc. if you want */}
      </div>

      {/* WhatsApp button uses handleWhatsApp */}

      {/* Working Hours card */}
      <div className="mt-8 bg-navy-900 text-white p-6 rounded-xl">
        <h4 className="font-bold text-lg mb-3">Working Hours</h4>
        <div className="space-y-2 text-sm">
          {WORKING_HOURS.map((row) => (
            <div key={row.label} className="flex justify-between">
              <span className="text-gray-300">{row.label}</span>
              <span className="font-semibold">{row.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ... */}
    </section>
  );
}
