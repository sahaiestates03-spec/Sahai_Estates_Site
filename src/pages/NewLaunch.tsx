import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjects } from "@/data/newLaunch";

export default function NewLaunch() {
  const [projects, setProjects] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { fetchProjects().then(setProjects); }, []);

  const filtered = projects.filter(p =>
    (p.project_name + " " + p.locality + " " + p.developer_name)
      .toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-24">
      <h1 className="text-3xl font-semibold mb-4">New Launch • Under Construction</h1>

      <input
        placeholder="Search by project / developer / locality"
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
                {p.price_min_inr && p.price_max_inr
                  ? `₹${Number(p.price_min_inr).toLocaleString()} – ₹${Number(p.price_max_inr).toLocaleString()}`
                  : "Price on request"}
              </div>
              <div className="flex gap-2 mt-4">
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
