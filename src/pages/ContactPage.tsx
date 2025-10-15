import ContactForm from '../components/ContactForm';

export default function ContactPage() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Contact <span className="text-brand-500">Us</span>
          </h1>
          <p className="text-lg text-gray-300">
            Let's discuss your luxury property needs
          </p>
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
