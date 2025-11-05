// src/data/newLaunch.ts
export type Project = {
  project_id: string; slug: string; project_name: string; developer_name: string;
  segment: string; status: string; new_launch: string | boolean;
  for_sale: string | boolean; locality: string; city: string; zone: string;
  hero_image_url: string; gallery_image_urls: string;
  price_min_inr: string; price_max_inr: string;
  unit_types: string; brochure_url: string;
};

const SHEET_CSV_URL = import.meta.env.VITE_NEWLAUNCH_SHEET_CSV as string;

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
  const csv = await res.text();
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    const obj: any = {};
    headers.forEach((h, i) => obj[h.trim()] = (cols[i] || "").replace(/^"|"$/g, ""));
    return obj as Project;
  }).filter(p =>
    String(p.status).toLowerCase() === "under construction" &&
    (String(p.new_launch).toLowerCase() === "true" || p.new_launch === true)
  );
}
