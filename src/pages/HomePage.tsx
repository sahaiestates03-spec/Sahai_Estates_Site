import RotatingHero from '../components/RotatingHero';
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import ContactForm from '../components/ContactForm';
import FeaturedNewLaunch from "../components/FeaturedNewLaunch";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <RotatingHero
  images={[
    "/BG-IMG-1.jpg",
    "/BG-IMG-3.jpg",
    "/BG-IMG-5.jpg",
    "/BG-IMG-6.jpg",
    "/BG-IMG-7.jpg",
    "/BG-IMG-8.jpg",
    "/BG-IMG-9.jpg",
    "/BG-IMG-10.jpg",
    "/BG-IMG-11.jpg",
  ]}
  interval={6000}
  /* ⬇️ Yahi se height control hoti hai */
  heightClass="min-h-[650px] md:min-h-[800px] lg:min-h-[920px]"
>
  <Hero />
</RotatingHero>
<FeaturedNewLaunch />


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
