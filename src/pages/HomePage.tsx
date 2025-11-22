import RotatingHero from "../components/RotatingHero";
import Hero from "../components/Hero";
import FeaturedProperties from "../components/FeaturedProperties";
import About from "../components/About";
import Testimonials from "../components/Testimonials";
import ContactForm from "../components/ContactForm";
import HomeSearch from "../components/HomeSearch";
import FeaturedNewLaunch from "../components/FeaturedNewLaunch";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* HERO BACKGROUND + HEADING + BUTTONS + SEARCH */}
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
          {/* ⬇️ Ye Hero.tsx ka content hai: "Luxury Living in South Mumbai" + buttons */}
          <Hero />

          {/* ⬇️ Hero text ke thode neeche search bar */}
          <HomeSearch />
        </RotatingHero>
      </div>

      {/* FEATURED NEW LAUNCHES – hero ke neeche, search se peeche */}
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
