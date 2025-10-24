import { Link } from 'react-router-dom';
import { useState } from 'react';


export default function Hero() {
const [query, setQuery] = useState('');


const handleSearch = (e) => {
e.preventDefault();
window.location.href = `/properties?search=${encodeURIComponent(query)}`;
};


return (
<section className="relative bg-navy-900/60 text-white pt-28 pb-20">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
<h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
Luxury Living in <span className="text-brand-500">South Mumbai</span>
</h1>
<p className="mt-4 text-lg text-gray-200 max-w-3xl mx-auto">
Discover exclusive sea-facing apartments and premium residences in Mumbai's most prestigious neighborhoods
</p>


<div className="mt-8 flex flex-wrap justify-center gap-4">
<Link
to="/properties"
className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold"
>
Explore Listings
</Link>
<Link
to="/contact"
className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold"
>
Contact Me
</Link>
</div>


{/* Search Bar */}
<form onSubmit={handleSearch} className="mt-10 max-w-xl mx-auto flex items-center bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
<input
type="text"
value={query}
onChange={(e) => setQuery(e.target.value)}
placeholder="Search South Mumbai properties..."
className="w-full px-4 py-3 bg-transparent focus:outline-none text-white placeholder-gray-300"
/>
<button type="submit" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 font-semibold">
Search
</button>
</form>
</div>
</section>
);
}
