import RotatingHero from "../components/RotatingHero";
// import Hero from "../components/Hero"; // abhi use nahi ho raha, isliye optional
import FeaturedProperties from "../components/FeaturedProperties";
import About from "../components/About";
import Testimonials from "../components/Testimonials";
import ContactForm from "../components/ContactForm";
import HomeSearch from "../components/HomeSearch";
import FeaturedNewLaunch from "../components/FeaturedNewLaunch";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* HERO SECTION (peeche background image) + SEARCH (upar) */}
      <div className="relative z-[50]">
        <RotatingHero
          images={[
            "/BG-IMG-3.jpg",
            "/BG-IMG-6.jpg",
            "/BG-IMG-7.jpg",
            "/BG-IMG-8.jpg",
            "/BG-IMG-9.jpg",
            "/BG-IMG-10.jpg",
            "/BG-IMG-11.jpg",
          ]}
          interval={6000}
          heightClass="min-h-[650px] md:min-h-[800px] lg:min-h-[920px]"
        >
          {/* Yahi pe search dikh raha hai */}
          <HomeSearch />
        </RotatingHero>
      </div>

      {/* FEATURED NEW LAUNCHES HERO KE NICHE, Z-INDEX KAM */}
      <div className="relative z-[10]">
        <FeaturedNewLaunch />
      </div>

      {/* Featured properties section */}
      <section className="max-w-6xl mx-auto p-6">
        <FeaturedProperties />
      </section>

      <About />
      <Testimonials />
      <ContactForm />
    </div>
  );
}
