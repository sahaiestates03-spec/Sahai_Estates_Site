import RotatingHero from '../components/RotatingHero';  // ✅ Add this
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import ContactForm from '../components/ContactForm';

export default function HomePage() {
  return (
    <div>
      <RotatingHero
        images={[
          "/public/BG-IMG-1.jpg",
          "/public/BG-IMG-2.jpg",
          "/public/BG-IMG-3.jpg",
          "/public/BG-IMG-4.jpg",
          "/public/BG-IMG-5.jpg",
        ]}
        interval={6000} // 6 seconds — change if needed
      >
        <Hero /> {/* ✅ Your existing hero content stays inside */}
      </RotatingHero>

      <FeaturedProperties />
      <About />
      <Testimonials />
      <ContactForm />
    </div>
  );
}
