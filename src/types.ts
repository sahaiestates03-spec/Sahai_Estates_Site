export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  propertyType: string;
  amenities: string[];
  images: string[];
  isFeatured: boolean;
  status: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientDesignation: string;
  testimonial: string;
  rating: number;
  imageUrl?: string;
}

export interface ContactLead {
  name: string;
  email: string;
  phone: string;
  propertyRequirements: string;
  propertyId?: string;
}
