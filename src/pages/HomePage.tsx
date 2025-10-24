import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import ContactForm from '../components/ContactForm';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <FeaturedProperties />
      <About />
      <Testimonials />
      <ContactForm />
    </div>
  );
}
