// src/pages/BlogPost.tsx
import { useParams, Link } from "react-router-dom";
import { posts } from "../data/posts";

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-gray-600">Post not found.</p>
          <Link to="/blog" className="text-brand-600 hover:text-brand-700">← Back to Blog</Link>
        </div>
      </section>
    );
  }

  return (
    <article className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/blog" className="text-brand-600 hover:text-brand-700">← Back to Blog</Link>
        <h1 className="mt-3 text-4xl font-serif font-bold text-navy-900">{post.title}</h1>
        <time className="block mt-2 text-xs text-gray-500">
          {new Date(post.date).toLocaleDateString()}
        </time>

        {post.cover && (
          <img src={post.cover} alt={post.title} className="mt-6 w-full rounded-xl" />
        )}

        {/* content is HTML string—safe because it's your own data file */}
        <div
          className="prose prose-invert:prose-invert max-w-none mt-8 prose-headings:text-navy-900 prose-p:text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
