import RotatingHero from "../components/RotatingHero";
// import Hero from "../components/Hero"; // abhi use nahi ho raha, isliye comment kar diya
import FeaturedProperties from "../components/FeaturedProperties";
import About from "../components/About";
import Testimonials from "../components/Testimonials";
import ContactForm from "../components/ContactForm";
import HomeSearch from "../components/HomeSearch";
import FeaturedNewLaunch from "../components/FeaturedNewLaunch";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* HERO + SEARCH ALWAYS ON TOP */}
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
          /* ⬇️ Yahi se height control hoti hai */
          heightClass="min-h-[650px] md:min-h-[800px] lg:min-h-[920px]"
        >
          {/* ⬇️ Yehi pe search dikhaya jayega, isliye HomeSearch ko yahan rakho */}
          <HomeSearch />
        </RotatingHero>
      </div>

      {/* FEATURED NEW LAUNCHES THODA PEECHE */}
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
