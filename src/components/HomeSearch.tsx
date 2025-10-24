import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Tab = 'resale' | 'rent' | 'under-construction';
type Segment = 'residential' | 'commercial';

export default function HomeSearch() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('resale');
  const [segment, setSegment] = useState<Segment>('residential');
  const [location, setLocation] = useState('');
  const [min, setMin] = useState<string>('');
  const [max, setMax] = useState<string>('');

  const go = () => {
    // optional guard
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
    navigate(`/properties?${q.toString()}`);
  };

  const onEnter: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') go();
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

      {/* Row 1 */}
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
          <input
            id="location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={onEnter}
            placeholder="e.g. Prabhadevi, Worli, Malabar Hill"
            className="w-full px-3 py-2 border rounded-lg text-gray-800 placeholder-gray-500 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            autoComplete="street-address"
          />
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

      {/* Row 2: Budget */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label htmlFor="min" className="block text-xs font-medium text-gray-600 mb-1">
            Budget (Min)
          </label>
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
          <label htmlFor="max" className="block text-xs font-medium text-gray-600 mb-1">
            Budget (Max)
          </label>
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
      </div>
    </div>
  );
}
