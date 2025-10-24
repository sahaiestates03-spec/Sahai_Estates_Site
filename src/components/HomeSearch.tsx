import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin, Search as SearchIcon, X, Crosshair, Mic } from 'lucide-react';

type Tab = 'resale' | 'rent' | 'under-construction';
type Segment = 'residential' | 'commercial';

const POPULAR_LOCALITIES = [
  'Worli', 'Worli Sea Face', 'Lower Parel', 'Prabhadevi', 'Malabar Hill',
  'Breach Candy', 'Cuffe Parade', 'Pedder Road', 'Kemps Corner', 'Tardeo',
  'Churchgate', 'Walkeshwar', 'Altamount Road', 'Napean Sea Road'
];

const BUDGETS = [
  { label: 'Up to ₹5 Cr', min: '', max: '50000000' },
  { label: '₹5–10 Cr',   min: '50000000',  max: '100000000' },
  { label: '₹10–15 Cr',  min: '100000000', max: '150000000' },
  { label: '₹15–25 Cr',  min: '150000000', max: '250000000' },
  { label: '₹25 Cr+',    min: '250000000', max: '' },
];

const PTYPES = ['Apartment', 'Penthouse', 'Duplex', 'Villa', 'Sky Villa', 'Office', 'Retail'];

export default function HomeSearch() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('resale');
  const [segment, setSegment] = useState<Segment>('residential');

  const [location, setLocation] = useState('');
  const [showSuggest, setShowSuggest] = useState(false);
  const [cursor, setCursor] = useState(-1);

  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [bhk, setBhk] = useState('');
  const [ptype, setPtype] = useState('');

  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('recentLocs') || '[]'); } catch { return []; }
  });

  const suggestRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(() => {
    const q = location.trim().toLowerCase();
    const base = q
      ? POPULAR_LOCALITIES.filter(l => l.toLowerCase().includes(q))
      : POPULAR_LOCALITIES.slice(0, 8);
    // merge recent (top)
    const merged = [...recent.filter(r => !q || r.toLowerCase().includes(q)), ...base];
    // unique
    return Array.from(new Set(merged)).slice(0, 8);
  }, [location, recent]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!suggestRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!suggestRef.current.contains(e.target)) setShowSuggest(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const pickSuggestion = (val: string) => {
    setLocation(val);
    setShowSuggest(false);
    // store recent
    const next = [val, ...recent.filter(r => r !== val)].slice(0, 6);
    setRecent(next);
    localStorage.setItem('recentLocs', JSON.stringify(next));
  };

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

  const onLocKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!showSuggest && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) setShowSuggest(true);
    if (e.key === 'ArrowDown') { setCursor(c => Math.min(c + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp')   { setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === 'Enter') {
      if (showSuggest && cursor >= 0) pickSuggestion(suggestions[cursor]);
      else go();
    }
  };

  const clearAll = () => { setLocation(''); setMin(''); setMax(''); setBhk(''); setPtype(''); };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-4 md:p-5">
      {/* Tabs row */}
      <div className="flex gap-4 text-[14px] font-semibold">
        {(['resale','rent','under-construction'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg border transition ${
              tab === t ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {t === 'resale' ? 'Buy' : t === 'rent' ? 'Rent' : 'New Launch'}
          </button>
        ))}
      </div>

      {/* Row: segment + location + action icons + search */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-[220px_1fr_56px_56px_140px] gap-3 items-end">
        {/* Segment */}
        <div>
          <label htmlFor="segment" className="block text-xs font-medium text-gray-600 mb-1">All Residential / Commercial</label>
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

        {/* Location with autosuggest */}
        <div className="relative" ref={suggestRef}>
          <label htmlFor="location" className="block text-xs font-medium text-gray-600 mb-1">Search</label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input
              id="location"
              value={location}
              onChange={e => { setLocation(e.target.value); setCursor(-1); }}
              onFocus={() => setShowSuggest(true)}
              onKeyDown={onLocKey}
              placeholder='Search "3 BHK in Worli" or "Office in Lower Parel"'
              className="w-full pl-9 pr-8 py-2 border rounded-lg text-gray-800 placeholder-gray-500 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
            {/* chevron to open advanced */}
            <button
              type="button"
              onClick={() => setShowSuggest(s => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label="Toggle suggestions"
            >
              <ChevronDown size={18}/>
            </button>
          </div>

          {/* Suggestion dropdown */}
          {showSuggest && (
            <div className="absolute z-30 mt-2 w-full bg-white rounded-xl border shadow-lg p-3">
              {/* recent */}
              {recent.length > 0 && (
                <>
                  <div className="text-[11px] text-gray-500 mb-1">Recent</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {recent.map(r => (
                      <button
                        key={r}
                        className="text-xs px-3 py-1 rounded-full border bg-white hover:border-brand-500"
                        onClick={() => pickSuggestion(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="text-[11px] text-gray-500 mb-1">Popular localities</div>
              <ul>
                {suggestions.map((s, i) => (
                  <li key={s}>
                    <button
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => pickSuggestion(s)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left ${
                        i === cursor ? 'bg-gray-100' : ''
                      }`}
                    >
                      <MapPin size={16} className="text-brand-600"/> {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Current location (placeholder) */}
        <button
          type="button"
          title="Use current location"
          className="h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"
          onClick={() => alert('Current location feature can be wired to Google Maps Geolocation API if you want.')}
        >
          <Crosshair size={18}/>
        </button>

        {/* Mic (placeholder) */}
        <button
          type="button"
          title="Voice search"
          className="h-10 rounded-lg border flex items-center justify-center hover:bg-gray-50"
          onClick={() => alert('Voice search can be added later.')}
        >
          <Mic size={18}/>
        </button>

        {/* Search */}
        <button
          onClick={go}
          className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          Search
        </button>
      </div>

      {/* EXPANDED “more filters” like 99acres */}
      <div className="mt-3 rounded-xl border border-gray-200 p-4 bg-gray-50">
        {/* Budget pills */}
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-600 mb-2">Quick Budget</div>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map(b => (
              <button
                key={b.label}
                onClick={() => { setMin(b.min); setMax(b.max); }}
                className={`text-xs px-3 py-1 rounded-full border ${
                  min === b.min && max === b.max
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-brand-500'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget & BHK & Type */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="min" className="block text-xs font-medium text-gray-600 mb-1">Budget (Min)</label>
            <input
              id="min"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 50000000"
              value={min}
              onChange={e => setMin(e.target.value.replace(/\D/g, ''))}
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
              className="w-full px-3 py-2 border rounded-lg text-gray-800 placeholder-gray-500 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <p className="text-[10px] text-gray-500 mt-1">Amount in INR</p>
          </div>

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

          <div>
            <label htmlFor="ptype" className="block text-xs font-medium text-gray-600 mb-1">Property Type</label>
            <select
              id="ptype"
              value={ptype}
              onChange={e => setPtype(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">All Types</option>
              {PTYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* chips + clear */}
        <div className="mt-3 flex flex-wrap gap-2">
          {bhk && (
            <span className="text-xs px-2 py-1 bg-white border rounded-full">
              {bhk} BHK
              <button className="ml-1 text-gray-500" onClick={() => setBhk('')} aria-label="remove"><X size={12}/></button>
            </span>
          )}
          {(min || max) && (
            <span className="text-xs px-2 py-1 bg-white border rounded-full">
              Budget: {min ? `₹${(+min/1e7).toFixed(2)}Cr` : '—'} – {max ? `₹${(+max/1e7).toFixed(2)}Cr` : '—'}
              <button className="ml-1 text-gray-500" onClick={() => { setMin(''); setMax(''); }} aria-label="remove"><X size={12}/></button>
            </span>
          )}
          {ptype && (
            <span className="text-xs px-2 py-1 bg-white border rounded-full">
              {ptype}
              <button className="ml-1 text-gray-500" onClick={() => setPtype('')} aria-label="remove"><X size={12}/></button>
            </span>
          )}
          <div className="ml-auto">
            <button onClick={clearAll} className="text-sm text-gray-600 hover:text-brand-600">Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}
