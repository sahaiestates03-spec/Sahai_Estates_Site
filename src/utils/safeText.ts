export function toText(v: any): string | number | null {
  if (v == null) return null;
  if (typeof v === 'string' || typeof v === 'number') return v;
  // arrays => comma list, objects => JSON path-free string
  if (Array.isArray(v)) return v.filter(x => typeof x === 'string' || typeof x === 'number').join(', ');
  // fallback: try common props
  if (typeof v === 'object') {
    if ('label' in v && (typeof v.label === 'string' || typeof v.label === 'number')) return v.label as any;
    if ('name' in v && (typeof (v as any).name === 'string' || typeof (v as any).name === 'number')) return (v as any).name as any;
    return Object.values(v)
      .filter(x => typeof x === 'string' || typeof x === 'number')
      .slice(0, 4)
      .join(', ');
  }
  return String(v);
}
