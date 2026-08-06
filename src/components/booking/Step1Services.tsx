'use client';

import { AudioLines, Mic } from 'lucide-react';

export type ServiceType = 'jam' | 'rec';

interface Props {
  selected: ServiceType[];
  onChange: (services: ServiceType[]) => void;
  error?: string;
}

const SERVICES = [
  {
    id: 'jam' as ServiceType,
    Icon: AudioLines,
    name: 'Jampad / Jam Room',
    desc: 'Professional gear & acoustics. Book at least 3 hours in advance.',
    price: '₹400',
    unit: '/hr',
    addons: 'Add-ons: Live Recording (+₹1,000/hr), In-Ear Monitoring (+₹300/hr)',
  },
  {
    id: 'rec' as ServiceType,
    Icon: Mic,
    name: 'Recording Studio',
    desc: 'Raw recording included. Next-day bookings only.',
    price: '₹1,000',
    unit: '/hr',
    addons: 'Add-on: Mixing & Mastering (from ₹6,000/song)',
  },
];

export function Step1Services({ selected, onChange, error }: Props) {
  function toggle(id: ServiceType) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div>
      <h2 className="text-[1.05rem] font-bold mb-1">Choose Your Service</h2>
      <p className="text-mu text-sm mb-5">
        Select one or both services for your session.
      </p>

      <div className="flex flex-col gap-3">
        {SERVICES.map((srv) => {
          const isSelected = selected.includes(srv.id);
          return (
            <div
              key={srv.id}
              id={`service-card-${srv.id}`}
              className={`srv-card${isSelected ? ' selected' : ''}`}
              onClick={() => toggle(srv.id)}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && toggle(srv.id)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <srv.Icon className={`w-6 h-6 ${isSelected ? 'text-gold' : 'text-mu'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[.95rem] font-semibold mb-1">{srv.name}</h3>
                  <p className="text-[.8rem] text-mu mb-2 leading-relaxed">{srv.desc}</p>
                  <div className="text-[1rem] font-bold text-gold mb-1">
                    {srv.price}{' '}
                    <span className="text-[.72rem] text-mu font-normal">{srv.unit}</span>
                  </div>
                  <div className="text-[.72rem] text-mu">{srv.addons}</div>
                </div>
                <div className="flex-shrink-0 ml-2 mt-1">
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: isSelected ? 'var(--gold)' : 'var(--c3)',
                      background: isSelected ? 'var(--gold)' : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && <div className="alert alert-error mt-4">⚠ {error}</div>}
    </div>
  );
}
