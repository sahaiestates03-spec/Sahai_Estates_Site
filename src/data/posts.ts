// src/data/posts.ts
export type Post = {
  slug: string;
  title: string;
  date: string;        // e.g. '2025-10-25'
  excerpt: string;
  cover?: string;      // optional image URL like '/images/blog/img1.jpg'
  content: string;     // simple HTML string
  tags?: string[];
};

export const posts: Post[] = [
  {
    slug: "south-mumbai-luxury-market-2025",
    title: "South Mumbai Luxury Market: 2025 Snapshot",
    date: "2025-10-25",
    excerpt:
      "Prices, absorption, and what buyers should watch in Worli, Prabhadevi, and Mahalaxmi.",
    cover: "/images/blog/market-2025.jpg",
    tags: ["Market Trends", "South Mumbai"],
    content: `
<p>South Mumbai continues to attract premium buyers, especially in <strong>Worli</strong>, <strong>Prabhadevi</strong>, and <strong>Mahalaxmi</strong>.</p>
<ul>
  <li>Absorption improving in 3–4 BHKs</li>
  <li>Developers offering flexible payment plans</li>
  <li>Quality amenities driving decision-making</li>
</ul>
<p>For project-specific insights, contact Sahai Estates.</p>
`
  },
  {
    slug: "buying-sea-facing-apartments-checklist",
    title: "Checklist: Buying a Sea-Facing Apartment in Mumbai",
    date: "2025-10-10",
    excerpt:
      "From wind load and corrosion to privacy and view corridors—what to check before you buy.",
    tags: ["Checklist", "Buyers"],
    content: `
<p>Sea-facing homes are aspirational, but come with unique considerations:</p>
<ol>
  <li><strong>View permanence:</strong> koi future building view block to nahi karegi?</li>
  <li><strong>Salt corrosion:</strong> windows/railings quality check.</li>
  <li><strong>Wind load:</strong> higher floors = better sealing.</li>
  <li><strong>Parking & access:</strong> valet/visitor parking.</li>
  <li><strong>Society rules:</strong> balcony glazing, façade norms, pets.</li>
</ol>
<p>We guide clients through each step.</p>
`
  }
];
