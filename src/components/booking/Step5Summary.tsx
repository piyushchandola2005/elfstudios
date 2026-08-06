import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Step5Props {
  attendees: number;
  hours: number;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export function Step5Summary({ attendees, hours, onNext, onBack, onCancel }: Step5Props) {
  const [loading, setLoading] = useState(false);
  const pricePerHour = attendees <= 5 ? 400 : 100 * attendees;
  const total = pricePerHour * hours;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payu/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendees,
          totalAmount: total,
          // In a full implementation, these would be passed down from state:
          bandName: "The Local Train",
          phone: "9876543210",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to initiate payment");
      }

      const { url, params } = await res.json();

      // Create a hidden form and submit it to redirect to PayU
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;

      Object.keys(params).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Error initiating payment. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/50 drop-shadow-md">
          Step 4
        </h2>
        <h3 className="font-display font-black text-2xl uppercase text-white tracking-wide">
          Review & Checkout
        </h3>
        <p className="font-sans text-[13px] text-white/60 font-light">
          Please review your booking details before proceeding to payment.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 space-y-4 shadow-inner">
        <div className="flex justify-between border-b border-white/10 pb-4">
          <span className="font-mono text-[11px] text-white/40 uppercase tracking-widest">Jam Session</span>
          <span className="font-display text-[15px] uppercase text-white font-bold">Selected Slots</span>
        </div>
        
        <div className="flex justify-between border-b border-white/10 pb-4">
          <span className="font-mono text-[11px] text-white/40 uppercase tracking-widest">Attendees</span>
          <span className="font-display text-[15px] uppercase text-white font-bold">{attendees} members</span>
        </div>

        <div className="flex justify-between items-end pt-2">
          <span className="font-mono text-[11px] text-white/40 uppercase tracking-widest">Total (Advance)</span>
          <div className="text-right">
            <span className="font-display text-4xl text-white font-black drop-shadow-md">₹{total}</span>
            <p className="font-mono text-[10px] text-white/40 mt-1 uppercase tracking-widest">₹{pricePerHour}/hr × {hours} hrs</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 items-center">
        <button 
          onClick={onCancel} 
          disabled={loading}
          className="h-[50px] px-6 text-white/40 hover:text-red-400 font-bold tracking-widest uppercase transition-colors text-[11px]"
        >
          Cancel
        </button>
        <div className="flex-1"></div>
        <button 
          onClick={onBack}
          disabled={loading}
          className="h-[50px] px-8 bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white font-bold tracking-widest uppercase transition-colors rounded-xl text-[11px]"
        >
          Back
        </button>
        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="h-[50px] px-8 bg-white text-black hover:bg-white/90 font-bold tracking-widest uppercase transition-all rounded-xl text-[11px] shadow-sm transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Processing..." : `Pay ₹${total}`}
        </button>
      </div>
    </div>
  );
}
