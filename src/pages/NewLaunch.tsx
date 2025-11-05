// src/pages/NewLaunch.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNewLaunch, type Project } from "./data/newLaunch";

function rupee(n?: string) {
  if (!n) return "";
  const x = Number(n);
  if (!x) return "";
  if (x >= 1e7) return `₹${(x/1e7).toFixed(2)} Cr`;
  if (x >= 1e5) return `₹${(x/1e5).toFixed(2)} L`;
  return `₹${x.toLocaleString("en-IN")}`;
}

export default function NewLaunch() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { fetchNewLaunch().then(setProjects); }, []);

  const filtered = projects.filter(p =>
    (p.project_name + " " + p.locality + " " + p.city + " " + p.developer_name)
      .toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-24">
      <h1 className="text-3xl font-semibold mb-4">New Launch • Under Construction</h1>

      <input
        placeholder="Search by project/developer/locality"
        className="w-full md:w-1/2 border rounded-xl px-4 py-2 mb-6"
        value={q} onChange={e=>setQ(e.target.value)}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(p => (
          <div key={p.slug} className="rounded-2xl overflow-hidden shadow border bg-white/70 backdrop-blur">
            <img src={p.hero_image_url} alt={p.project_name} className="h-44 w-full object-cover"/>
            <div className="p-4">
              <div className="text-lg font-semibold">{p.project_name}</div>
              <div className="text-sm text-gray-600">{p.locality}, {p.city}</div>
              <div className="text-sm mt-1">{p.unit_types}</div>
              <div className="text-sm mt-1">
                {(p.price_min_inr && p.price_max_inr)
                  ? `${rupee(p.price_min_inr)} – ${rupee(p.price_max_inr)}`
                  : "Price on request"}
              </div>
              <div className="flex gap-2 mt-4">
                {/* Aapke existing detail route ke hisaab se slug open hoga */}
                <Link to={`/properties/${p.slug}`} className="px-3 py-2 rounded-xl border">View Details</Link>
                <Link to={`/properties/${p.slug}#brochure`} className="px-3 py-2 rounded-xl bg-black text-white">Get Brochure</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
