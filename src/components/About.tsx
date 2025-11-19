import { Award, Users, Home, TrendingUp } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: Home, value: '500+', label: 'Properties Sold' },
    { icon: Users, value: '300+', label: 'Happy Clients' },
    { icon: TrendingUp, value: '₹1000+ Cr', label: 'Worth Transacted' },
    { icon: Award, value: '30+', label: 'Years Experience' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy-900 mb-4">
                About <span className="text-brand-600">Us</span>
              </h2>
              <div className="w-20 h-1 bg-brand-600"></div>
            </div>

            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              With over 30 years of experience in South Mumbai's luxury real estate market,
              We specialize in premium apartments, sea-facing homes, and exclusive properties
              in the city's most prestigious neighborhoods.
            </p>

            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Our deep understanding of the South Mumbai property landscape, combined with
              personalized service and market expertise, has helped hundreds of discerning
              clients find their dream homes and make sound investment decisions.
            </p>

            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              We believe in building lasting relationships based on trust, transparency,
              and delivering exceptional results. Whether you're buying, selling, or
              investing, We are committed to making your real estate journey seamless
              and successful.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-brand-50 px-6 py-3 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold">RERA No: A51900001512</p>
              </div>
              <div className="bg-brand-50 px-6 py-3 rounded-lg">
                <p className="text-sm text-gray-600">Member, SMART</p>
              </div>
              <div className="bg-brand-50 px-6 py-3 rounded-lg">
                <p className="text-sm text-gray-600">Member, NAR India</p>
              </div>
            </div>
          </div>

          <div>
            <div className="relative">
              <img
                src="/SIR1.jpg"
                alt="Real Estate Professional"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-navy-900 text-white p-6 rounded-xl shadow-xl max-w-xs">
                <p className="text-3xl font-bold text-brand-500 mb-1">30+</p>
                <p className="text-sm">Years of Excellence in Luxury Real Estate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-full mb-4">
                  <Icon className="text-brand-600" size={28} />
                </div>
                <h3 className="text-3xl font-bold text-navy-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
