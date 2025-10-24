import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';

type Tab = 'resale' | 'rent' | 'under-construction';
type Segment = 'residential' | 'commercial';

const BUDGET_PRESETS = [
  { label: 'Up to ₹5 Cr', min: '', max: '50000000' },
  { label: '₹5 Cr – ₹10 Cr', min: '50000000', max: '100000000' },
  { label: '₹10 Cr – ₹15 Cr', min: '100000000', max: '150000000' },
  { label: '₹15 Cr – ₹25 Cr', min: '150000000', max: '250000000' },
  { label: 'Above ₹25 Cr', min: '250000000', max: '' },
];

const PROPERTY_TYPES = [
  'Apartment', 'Penthouse', 'Villa', 'Duplex', 'Sky Villa', 'Office', 'Retail'
];

export default function HomeSearch() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('resale');
  const [segment, setSegment] = useState<Segment>('residential');
  const [location, setLocation] = useState('');
  const [min, setMin] = useState<string>('');
  const [max, setMax] = useState<string>('');
  const [bhk, setBhk] = useState<string>('');          // '', '2', '3', '4', '5'
  const [ptype, setPtype] = useState<string>('');      // propertyType
  const [open, setOpen] = useState(false);             // advanced panel
  const panelRef = useRef<HTMLDivElement | null>(null);

  const go = () => {
    if (min && max && Number(min) > Number(max)) {
      alert('Min budget cannot be greater than Max budget.');
      return;
    }
    const q = new URLSearchParams();
    q.set('for', tab);
    q.set('segment', segment);
    if (location.trim()) q.set('location', location.trim());
    if (min) q.set('min', min);
    if (max) q.set('max', max);
    if (bhk) q.set('bhk', bhk);
    if (ptype) q.set('ptype', ptype);
    navigate(`/properties?${q.toString()}`);
  };

  const onEnter: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') go();
  };

  // close advanced when clicking outside (desktop UX nicety)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) return;
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const clearAll = () => {
    setLocation('');
    setMin(''); setMax('');
    setBhk('');
    setPtype('');
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-4 md:p-5">
      {/* Tabs */}
      <div className="flex gap-3 text-sm font-semibold">
        {(['resale','rent','under-construction'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg border ${
              tab === t ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-gray-700 border-gray-300'
            }`}
            aria-pressed={tab === t}
          >
            {t === 'resale' ? 'Resale' : t === 'rent' ? 'Rent' : 'Under Construction'}
          </button>
        ))}
      </div>

      {/* Top row: segment + location + search */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="col-span-1">
          <label htmlFor="segment" className="block text-xs font-medium text-gray-600 mb-1">
            Property Segment
          </label>
          <select
            id="segment"
            value={segment}
            onChange={e => setSegment(e.target.value as Segment)}
            className="w-full px-3 py-2 border rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="residential">All Residential</option>
            <option value="commercial">All Commercial</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="location" className="block text-xs font-medium text-gray-600 mb-1">
            Location / Area
          </label>
          <div className="relative">
            <input
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={onEnter}
              placeholder='Try "Worli", "Prabhadevi", "Malabar Hill"'
              className="w-full px-3 py-2 border rounded-lg text-gray-800 placeholder-gray-500 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              autoComplete="street-address"
            />
            {/* Toggle chip */}
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label="More filters"
              title="More filters"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        <div className="md:col-span-1 flex items-end">
          <button
            onClick={go}
            className="w-full bg-navy-900 hover:bg-brand-600 text-white px-4 py-3 rounded-lg font-semibold"
          >
            Search
          </button>
        </div>
      </div>

      {/* Advanced panel */}
      {open && (
        <div ref={panelRef} className="mt-3 rounded-xl border border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Budget Presets */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Quick Budget</label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => { setMin(p.min); setMax(p.max); }}
                    className={`text-xs px-3 py-1 rounded-full border ${
                      min === p.min && max === p.max
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-brand-500'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Budget */}
            <div>
              <label htmlFor="min" className="block text-xs font-medium text-gray-600 mb-1">Budget (Min)</label>
              <input
                id="min"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 50000000"
                value={min}
                onChange={e => setMin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={onEnter}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 placeholder-gray-500 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <p className="text-[10px] text-gray-500 mt-1">Amount in INR</p>
            </div>
            <div>
              <label htmlFor="max" className="block text-xs font-medium text-gray-600 mb-1">Budget (Max)</label>
              <input
                id="max"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 200000000"
                value={max}
                onChange={e => setMax(e.target.value.replace(/\D/g, ''))}
                onKeyDown={onEnter}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 placeholder-gray-500 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <p className="text-[10px] text-gray-500 mt-1">Amount in INR</p>
            </div>

            {/* Bedrooms */}
            <div>
              <label htmlFor="bhk" className="block text-xs font-medium text-gray-600 mb-1">Bedrooms</label>
              <select
                id="bhk"
                value={bhk}
                onChange={e => setBhk(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">Any</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label htmlFor="ptype" className="block text-xs font-medium text-gray-600 mb-1">Property Type</label>
              <select
                id="ptype"
                value={ptype}
                onChange={e => setPtype(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Selected chips + Clear */}
          <div className="mt-3 flex flex-wrap gap-2">
            {bhk && (
              <span className="text-xs px-2 py-1 bg-white border rounded-full">
                {bhk} BHK
                <button className="ml-1 text-gray-500" onClick={() => setBhk('')} aria-label="Remove BHK"><X size={12}/></button>
              </span>
            )}
            {(min || max) && (
              <span className="text-xs px-2 py-1 bg-white border rounded-full">
                Budget: {min ? `₹${(+min/1e7).toFixed(2)}Cr` : '—'} to {max ? `₹${(+max/1e7).toFixed(2)}Cr` : '—'}
                <button className="ml-1 text-gray-500" onClick={() => { setMin(''); setMax(''); }} aria-label="Remove Budget"><X size={12}/></button>
              </span>
            )}
            {ptype && (
              <span className="text-xs px-2 py-1 bg-white border rounded-full">
                {ptype}
                <button className="ml-1 text-gray-500" onClick={() => setPtype('')} aria-label="Remove type"><X size={12}/></button>
              </span>
            )}
            <div className="ml-auto">
              <button onClick={clearAll} className="text-sm text-gray-600 hover:text-brand-600">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
