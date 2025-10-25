// src/pages/Blog.tsx
import { Link } from "react-router-dom";
import { posts } from "./data/posts";

export default function Blog() {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-navy-900">
            Blog
          </h1>
          <p className="text-gray-600 mt-3">
            Insights on South Mumbai luxury real estate.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map((p) => (
            <article key={p.slug} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              {p.cover && (
                <img src={p.cover} alt={p.title} className="w-full h-44 object-cover rounded-t-2xl" />
              )}
              <div className="p-6">
                <time className="text-xs text-gray-500">
                  {new Date(p.date).toLocaleDateString()}
                </time>
                <h2 className="mt-2 text-xl font-bold text-navy-900">
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                </h2>
                <p className="mt-2 text-gray-600 text-sm">{p.excerpt}</p>
                <div className="mt-4">
                  <Link
                    to={`/blog/${p.slug}`}
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
