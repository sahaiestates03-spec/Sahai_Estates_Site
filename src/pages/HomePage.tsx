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

      {/* ✅ No manual heading here; component will render its own section */}
      <section className="max-w-6xl mx-auto p-6">
        <FeaturedProperties />
      </section>

      <About />
      <Testimonials />
      <ContactForm />
    </div>
  );
}
