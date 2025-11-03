import { useRef, useState } from "react";

type Picked = { file: File; url: string };

export default function AdminUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Picked[]>([]);
  const [folder, setFolder] = useState<string>("residential/Example-Property");
  const [segment, setSegment] = useState<"residential" | "commercial">("residential");
  const [listingFor, setListingFor] = useState<"resale" | "rent" | "under-construction">("resale");

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files || []);
    const picks = f.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setFiles(picks);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = Array.from(e.dataTransfer.files || []);
    const picks = f.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setFiles(picks);
  };

  const prevent = (e: React.DragEvent) => e.preventDefault();

  // Generated Sheet "images" field
  const imagesList = files
    .map((_, i) => `${folder.replace(/^\/+|\/+$/g, "")}/${i + 1}.jpg`)
    .join(", ");

  // If you want to store a shorthand (and let frontend auto-expand /1.jpg,/2.jpg…)
  const imagesFolderShorthand = `${folder.replace(/^\/+|\/+$/g, "")}/*`;

  /** Create a zip named after the folder and download it */
  const downloadZip = async () => {
    try {
      // Lazy import (keeps main bundle small & avoids SSR import issues)
      const { default: JSZip } = await import("jszip");
      const { saveAs } = await import("file-saver");

      const zip = new JSZip();
      const base = folder.replace(/^\/+|\/+$/g, "");
      files.forEach((p, i) => {
        zip.file(`${base}/${i + 1}.jpg`, p.file);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${base.replace(/[\/]+/g, "_")}.zip`);
    } catch (err) {
      console.error(err);
      alert("Could not create ZIP. Please check console for details.");
    }
  };

  return (
    <main className="pt-24 max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Admin Upload Helper</h1>
      <p className="text-sm text-gray-600">
        Drag &amp; drop property photos, choose output folder, and copy the Google Sheet values.
      </p>

      <section className="mt-6 grid gap-4">
        <div className="flex gap-3">
          <div>
            <label className="text-xs font-semibold">Segment</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as any)}
              className="block border rounded px-2 py-1"
            >
              <option value="residential">residential</option>
              <option value="commercial">commercial</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold">Listing For</label>
            <select
              value={listingFor}
              onChange={(e) => setListingFor(e.target.value as any)}
              className="block border rounded px-2 py-1"
            >
              <option value="resale">resale</option>
              <option value="rent">rent</option>
              <option value="under-construction">under-construction</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold">Folder (relative to /prop-pics)</label>
          <input
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="residential/Beaumonde-903A"
          />
          <p className="text-xs text-gray-500 mt-1">
            Final path on site: <code>/prop-pics/{folder.replace(/^\/+/, "")}/1.jpg</code>
          </p>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={prevent}
          onDragEnter={prevent}
          className="mt-2 border-2 border-dashed rounded-xl p-6 text-center"
        >
          <p className="mb-2">Drag &amp; drop images here</p>
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 bg-navy-900 text-white rounded"
          >
            Or choose files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onPick}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {files.map((p, i) => (
                <div key={i} className="rounded border overflow-hidden">
                  <img src={p.url} alt={`img-${i}`} className="w-full h-32 object-cover" />
                  <div className="text-xs p-2">
                    Will be saved as <b>{i + 1}.jpg</b>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2">
              <div>
                <div className="text-xs font-semibold mb-1">
                  Images (explicit list for Google Sheet)
                </div>
                <textarea
                  readOnly
                  value={imagesList}
                  className="w-full border rounded p-2 text-xs"
                  rows={2}
                />
                <p className="text-[11px] text-gray-500">
                  Paste into Sheet &quot;images&quot; column.
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold mb-1">
                  Images (folder shorthand for Google Sheet)
                </div>
                <input
                  readOnly
                  value={imagesFolderShorthand}
                  className="w-full border rounded p-2 text-xs"
                />
                <p className="text-[11px] text-gray-500">
                  Alternatively paste folder shorthand. Site auto-discovers /1.jpg, /2.jpg …
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={downloadZip} className="px-4 py-2 bg-brand-600 text-white rounded">
                  Download ZIP (1.jpg,2.jpg…)
                </button>
                <a
                  href={`https://github.com/sahaiestates03-spec/Sahai_Estates_Site/tree/main/public/prop-pics`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 border rounded"
                >
                  Open GitHub /prop-pics
                </a>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
