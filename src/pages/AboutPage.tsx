import About from '../components/About';
import Testimonials from '../components/Testimonials';

export default function AboutPage() {
  return (
    <div className="pt-20">
      <div className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            About <span className="text-brand-500">Me</span>
          </h1>
          <p className="text-lg text-gray-300">
            Your trusted partner in South Mumbai luxury real estate
          </p>
        </div>
      </div>
      <About />
      <Testimonials />
    </div>
  );
}
