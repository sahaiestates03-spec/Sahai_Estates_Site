import { Star, Quote } from 'lucide-react';
import { testimonials } from '../data/mockData';

export default function Testimonials() {
  return (
    <section className="py-20 bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Client <span className="text-brand-500">Testimonials</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Hear what my clients have to say about their experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 relative"
            >
              <Quote className="text-brand-500 opacity-20 absolute top-6 right-6" size={48} />

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="text-brand-500 fill-brand-500" size={20} />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.testimonial}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.clientName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-navy-900">{testimonial.clientName}</h4>
                  <p className="text-sm text-gray-600">{testimonial.clientDesignation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
