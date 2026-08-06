import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface Step4Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step4Details({ onNext, onBack }: Step4Props) {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  const [details, setDetails] = useState({ bandName: "", equipmentRequests: "" });
  
  // In a real implementation, we'd fetch the DB user profile and pre-populate
  // these state variables if they already exist in the user's profile.

  const isFormValid = details.bandName.trim().length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/50 drop-shadow-md">
          Step 3
        </h2>
        <h3 className="font-display font-black text-2xl uppercase text-white tracking-wide">
          Session Details
        </h3>
        <p className="font-sans text-[13px] text-white/60 font-light">
          We need a few details about your band and equipment needs.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="bandName" className="text-[11px] font-mono uppercase tracking-widest text-white/50">
            Band / Artist Name *
          </label>
          <input
            id="bandName"
            type="text"
            required
            value={details.bandName}
            onChange={(e) => setDetails({ ...details, bandName: e.target.value })}
            placeholder="e.g. The Local Train"
            className="w-full h-[50px] bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white/50 transition-all font-sans text-[15px] shadow-sm backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="equipment" className="text-[11px] font-mono uppercase tracking-widest text-white/50">
            Equipment Requests (Optional)
          </label>
          <textarea
            id="equipment"
            value={details.equipmentRequests}
            onChange={(e) => setDetails({ ...details, equipmentRequests: e.target.value })}
            placeholder="Need an extra mic stand or specific cymbal?"
            className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white/50 transition-all font-sans text-[15px] shadow-sm resize-none backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 items-center">
        <button 
          onClick={onBack}
          className="h-[50px] px-8 bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white font-bold tracking-widest uppercase transition-colors rounded-xl text-xs"
        >
          Back
        </button>
        <button 
          onClick={onNext} 
          disabled={!details.bandName.trim()} 
          className="flex-1 h-[50px] bg-white text-black hover:bg-white/90 font-bold tracking-widest uppercase transition-all rounded-xl text-xs shadow-sm transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          Review Booking
        </button>
      </div>
    </div>
  );
}
