import { Home, Key, TrendingUp, Building2, FileCheck, Users } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      icon: Home,
      title: 'Property Buying',
      description: 'Expert guidance in finding and purchasing your dream luxury property. We handle everything from property search to legal documentation and possession.'
    },
    {
      icon: Key,
      title: 'Property Selling',
      description: 'Maximize your property value with our proven marketing strategies and extensive network of high-net-worth buyers. Professional photography and premium listings included.'
    },
    {
      icon: TrendingUp,
      title: 'Investment Advisory',
      description: 'Strategic investment guidance for maximum returns. Market analysis, appreciation potential assessment, and portfolio diversification recommendations.'
    },
    {
      icon: Building2,
      title: 'Luxury Rentals',
      description: 'Premium rental services for landlords and tenants. Property management, tenant screening, and lease agreement support for hassle-free rentals.'
    },
    {
      icon: FileCheck,
      title: 'Legal Assistance',
      description: 'Complete legal support including title verification, documentation, registration, and compliance with RERA and other regulatory requirements.'
    },
    {
      icon: Users,
      title: 'Property Management',
      description: 'Comprehensive property management services including maintenance coordination, rent collection, and tenant relations for property owners.'
    }
  ];

  const process = [
    {
      step: '01',
      title: 'Initial Consultation',
      description: 'Understanding your requirements, budget, and preferences through a detailed discussion.'
    },
    {
      step: '02',
      title: 'Property Search',
      description: 'Curating a personalized selection of properties that match your criteria perfectly.'
    },
    {
      step: '03',
      title: 'Site Visits',
      description: 'Organizing convenient property viewings with detailed insights about each location.'
    },
    {
      step: '04',
      title: 'Negotiation',
      description: 'Expert negotiation to secure the best price and terms for your transaction.'
    },
    {
      step: '05',
      title: 'Documentation',
      description: 'Managing all legal paperwork, verification, and compliance requirements.'
    },
    {
      step: '06',
      title: 'Handover',
      description: 'Smooth possession and post-sale support for a seamless transition.'
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Our <span className="text-brand-500">Services</span>
          </h1>
          <p className="text-lg text-gray-300">
            Comprehensive luxury real estate solutions tailored for you
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 mb-4">
            What We <span className="text-brand-600">Offer</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Full-spectrum real estate services designed for discerning clients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-2xl p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Our <span className="text-brand-500">Process</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              A streamlined, transparent approach to finding your perfect property
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {process.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors duration-300">
                  <div className="text-5xl font-bold text-brand-500 mb-4 opacity-50">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 bg-white p-12 rounded-2xl shadow-xl text-center">
          <h2 className="text-3xl font-bold text-navy-900 mb-4">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            <div>
              <div className="text-4xl font-bold text-brand-600 mb-2">15+</div>
              <p className="text-gray-600 font-medium">Years Experience</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600 mb-2">500+</div>
              <p className="text-gray-600 font-medium">Properties Sold</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600 mb-2">98%</div>
              <p className="text-gray-600 font-medium">Client Satisfaction</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600 mb-2">₹1000+ Cr</div>
              <p className="text-gray-600 font-medium">Worth Transacted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
