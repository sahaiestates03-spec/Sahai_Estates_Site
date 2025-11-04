import RotatingHero from '../components/RotatingHero';
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import ContactForm from '../components/ContactForm';

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ✅ Rotating Hero Section */}
      <RotatingHero
        images={[
          "/BG-IMG-1.jpg",
          "/BG-IMG-2.jpg",
          "/BG-IMG-3.jpg",
          "/BG-IMG-4.jpg",
          "/BG-IMG-5.jpg",
        ]}
        interval={6000}
        heightClass="min-h-[720px] md:min-h-[620px] lg:min-h-[680px]"
      >
        <Hero />
      </RotatingHero>

      {/* ✅ Featured Properties */}
      <section className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-serif font-bold text-center mb-2">
          Featured <span className="text-brand-600">Properties</span>
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Handpicked selection of our most exclusive luxury properties in South Mumbai
        </p>

        <FeaturedProperties />
        
        <div className="text-center mt-8">
          <a
            href="#/properties"
            className="inline-block px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-all"
          >
            View All Properties →
          </a>
        </div>
      </section>

      {/* ✅ Other Sections */}
      <About />
      <Testimonials />
      <ContactForm />
    </div>
  );
}
