import { Property, Testimonial } from '../types';

export const properties: Property[] = [
  {
    id: '1',
    title: 'Sea-Facing Luxury Penthouse',
    description: 'Stunning 4 BHK penthouse with panoramic views of the Arabian Sea. Features include Italian marble flooring, modular kitchen, private terrace, and premium fittings.',
    price: 125000000,
    location: 'Worli',
    bedrooms: 4,
    bathrooms: 5,
    areaSqft: 4500,
    propertyType: 'Penthouse',
    amenities: ['Sea View', 'Private Terrace', 'Club House', 'Swimming Pool', 'Gym', 'Concierge'],
    images: ['https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg'],
    isFeatured: true,
    status: 'available'
  },
  {
    id: '2',
    title: 'Premium Residency at Malabar Hill',
    description: 'Exclusive 3 BHK apartment in the heart of Malabar Hill. Prime location with world-class amenities and 24/7 security.',
    price: 95000000,
    location: 'Malabar Hill',
    bedrooms: 3,
    bathrooms: 4,
    areaSqft: 3200,
    propertyType: 'Apartment',
    amenities: ['City View', 'Valet Parking', 'Home Automation', 'Spa', 'Landscaped Gardens'],
    images: ['https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'],
    isFeatured: true,
    status: 'available'
  },
  {
    id: '3',
    title: 'Ultra-Luxury Villa in Breach Candy',
    description: 'Rare standalone villa with private pool and landscaped garden. Perfect blend of traditional elegance and modern luxury.',
    price: 180000000,
    location: 'Breach Candy',
    bedrooms: 5,
    bathrooms: 6,
    areaSqft: 6500,
    propertyType: 'Villa',
    amenities: ['Private Pool', 'Garden', 'Home Theater', 'Wine Cellar', 'Staff Quarters', 'Smart Home'],
    images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
    isFeatured: true,
    status: 'available'
  },
  {
    id: '4',
    title: 'Modern Duplex at Cuffe Parade',
    description: 'Sophisticated 4 BHK duplex with contemporary design and premium finishes. Located in the prestigious Cuffe Parade neighborhood.',
    price: 110000000,
    location: 'Cuffe Parade',
    bedrooms: 4,
    bathrooms: 5,
    areaSqft: 4000,
    propertyType: 'Duplex',
    amenities: ['Sea View', 'Private Lift', 'Balcony', 'Club House', 'Tennis Court', 'Kids Play Area'],
    images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
    isFeatured: false,
    status: 'available'
  },
  {
    id: '5',
    title: 'Elegant Apartment at Pedder Road',
    description: 'Spacious 3 BHK with high ceilings and designer interiors. Premium location with easy access to all amenities.',
    price: 85000000,
    location: 'Pedder Road',
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2800,
    propertyType: 'Apartment',
    amenities: ['Garden View', 'Gym', 'Security', 'Power Backup', 'Visitor Parking'],
    images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
    isFeatured: false,
    status: 'available'
  },
  {
    id: '6',
    title: 'Luxury Sky Villa at Prabhadevi',
    description: 'Exclusive sky villa on the 40th floor with 360-degree views. Features private elevator access and top-tier amenities.',
    price: 145000000,
    location: 'Prabhadevi',
    bedrooms: 5,
    bathrooms: 6,
    areaSqft: 5200,
    propertyType: 'Sky Villa',
    amenities: ['Panoramic View', 'Private Elevator', 'Infinity Pool', 'Helipad Access', 'Concierge', 'Smart Home'],
    images: ['https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg'],
    isFeatured: true,
    status: 'available'
  }
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    clientName: 'Rajesh Mehta',
    clientDesignation: 'CEO, Tech Ventures',
    testimonial: 'Exceptional service and deep knowledge of South Mumbai real estate. Found us the perfect sea-facing apartment that exceeded our expectations. Highly professional and trustworthy.',
    rating: 5
  },
  {
    id: '2',
    clientName: 'Priya Sharma',
    clientDesignation: 'Investment Banker',
    testimonial: 'The attention to detail and understanding of luxury properties is remarkable. Made our property search effortless and enjoyable. Would highly recommend for premium real estate needs.',
    rating: 5
  },
  {
    id: '3',
    clientName: 'Anil Kapoor',
    clientDesignation: 'Business Owner',
    testimonial: 'Professional, knowledgeable, and incredibly responsive. Helped us navigate the complex Mumbai real estate market with ease. The best in the business!',
    rating: 5
  }
];
