'use client';

import { useState, useEffect } from 'react';
import { Step1Services, ServiceType } from './Step1Services';
import { Step2DateSlots } from './Step2DateSlots';

const STEP_LABELS = [
  'Services',
  'Date & Slots',
  'Add-ons',
  'Details',
  'Payment',
  'Confirmed',
];

export function BookingWizard() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check immediately
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  function reset() {
    setStep(1);
    setServices([]);
    setDate('');
    setSlots([]);
    setError('');
  }

  function validateCurrent(): boolean {
    setError('');
    if (step === 1) {
      if (services.length === 0) { setError('Select at least one service.'); return false; }
    }
    if (step === 2) {
      if (!date) { setError('Pick a date.'); return false; }
      if (slots.length === 0) { setError('Pick at least one slot.'); return false; }
    }
    return true;
  }

  function next() {
    if (!validateCurrent()) return;
    setStep(s => Math.min(s + 1, 6));
  }
  function back() {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  }

  const isConfirmed = step === 6;
  const isModalActive = isMobile && step > 1;

  return (
    <div className={isModalActive ? "fixed inset-0 z-[200] bg-bk/80 backdrop-blur-xl flex flex-col justify-start pt-[8vh] p-2 sm:p-6" : ""}>
      <div className={`bg-c1 border border-c3 rounded-2xl overflow-hidden ${isModalActive ? 'w-full max-h-[90vh] flex flex-col relative shadow-2xl overflow-y-auto mx-auto' : ''}`}>
        
        {isModalActive && (
          <div className="flex justify-between items-center px-5 py-4 border-b border-c3 sticky top-0 bg-c1 z-20">
             <div className="font-bold text-[1.05rem]">Complete Booking</div>
             <button 
               className="bg-c2/80 text-tx rounded-full w-8 h-8 flex items-center justify-center hover:bg-c3 transition-colors border border-c3"
               onClick={() => setStep(1)}
               title="Back to services"
             >
               &times;
             </button>
          </div>
        )}

        {/* Step tabs */}
        {!isConfirmed && (
          <div className="wiz-steps px-1 pt-1">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            let cls = 'wiz-step-tab';
            if (n === step) cls += ' active';
            else if (n < step) cls += ' done';
            return (
              <div key={n} className={cls} id={`wiz-tab-${n}`}>
                {n < step ? '✓ ' : ''}{label}
              </div>
            );
          })}
        </div>
      )}

      {/* Step content */}
      <div className="p-6 md:p-8 flex flex-col">
        <div className="flex-1">
          {step === 1 && (
            <Step1Services selected={services} onChange={setServices} error={error} />
          )}
          {step === 2 && (
            <Step2DateSlots
              services={services}
              date={date}
              slots={slots}
              onDateChange={setDate}
              onSlotsChange={setSlots}
              error={error}
            />
          )}
          {step === 3 && (
            <div className="py-10 text-center text-mu">
               <div className="text-[1.2rem] font-bold text-gold mb-2">Add-ons</div>
               <p>Mock UI for Add-ons step. Click Next to continue.</p>
            </div>
          )}
          {step === 4 && (
            <div className="py-10 text-center text-mu">
               <div className="text-[1.2rem] font-bold text-gold mb-2">Your Details</div>
               <p>Mock UI for Details step. Click Next to continue.</p>
            </div>
          )}
          {step === 5 && (
            <div className="py-10 text-center text-mu">
               <div className="text-[1.2rem] font-bold text-gold mb-2">Payment</div>
               <p>Mock UI for Payment step. Click Next to complete booking.</p>
            </div>
          )}
          {step === 6 && (
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-subg text-su rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-mu mb-6">Your session has been successfully booked.</p>
              <button className="btn btn-gold" onClick={reset}>Book Another Session</button>
            </div>
          )}
        </div>

        {/* Navigation */}
        {!isConfirmed && (
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-c3">
            <div>
              {step > 1 && (
                <button id="wiz-back" className="btn btn-out" onClick={back}>
                  ← Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Step indicator dots */}
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map(n => (
                  <div
                    key={n}
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{
                      background: n === step ? 'var(--gold)' : n < step ? 'var(--su)' : 'var(--c3)',
                      width: n === step ? '20px' : '6px',
                    }}
                  />
                ))}
              </div>
              {step < 5 && (
                <button id="wiz-next" className="btn btn-gold" onClick={next}>
                  Next →
                </button>
              )}
              {step === 5 && (
                <button id="wiz-next" className="btn btn-gold" onClick={next}>
                  Pay & Book
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
