import RotatingHero from '../components/RotatingHero';
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import ContactForm from '../components/ContactForm';

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      <RotatingHero
        images={["/BG-IMG-1.jpg","/BG-IMG-2.jpg","/BG-IMG-3.jpg","/BG-IMG-4.jpg","/BG-IMG-5.jpg"]}
        interval={6000}
        heightClass="min-h-[720px] md:min-h-[620px] lg:min-h-[680px]"
      >
        <Hero />
      </RotatingHero>

      <section className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-serif font-bold text-center mb-2">
          Featured <span className="text-brand-600">Properties</span>
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Handpicked selection of our most exclusive luxury properties in South Mumbai
        </p>

        {/* Only this — no extra CTA below */}
        <FeaturedProperties />
      </section>

      <About />
      <Testimonials />
      <ContactForm />
    </div>
  );
}
