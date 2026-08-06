import React, { useState, useMemo } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  isBefore,
  startOfDay
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
  setHours: (hours: number) => void;
}

export function Step2DateTime({ onNext, onBack, setHours }: Step2Props) {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Generate 12 slots from 10 AM to 10 PM
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 10; i < 22; i++) {
      const ampm1 = i >= 12 ? "PM" : "AM";
      const ampm2 = (i + 1) >= 12 ? "PM" : "AM";
      const hour1 = i > 12 ? i - 12 : i;
      const hour2 = (i + 1) > 12 ? (i + 1) - 12 : (i + 1);
      
      slots.push({
        id: `${i}`,
        time: `${hour1}:00 ${ampm1} - ${hour2}:00 ${ampm2}`,
        // Mock some random bookings
        status: (i === 13 || i === 18) ? "BOOKED" : "AVAILABLE" 
      });
    }
    return slots;
  }, [selectedDate]); // Re-compute mock slots if date changes for realism (though mocked)

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const toggleSlot = (id: string) => {
    setSelectedSlots(prev => 
      prev.includes(id) ? prev.filter(slot => slot !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    setHours(selectedSlots.length);
    onNext();
  };

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = startOfDay(new Date());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/50 drop-shadow-md">
          Step 2
        </h2>
        <h3 className="font-display font-black text-2xl uppercase text-white tracking-wide">
          Select Date & Time
        </h3>
        <p className="font-sans text-[13px] text-white/60 font-light">
          Pick a date from the calendar and choose available 1-hour slots.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 w-full">
        
        {/* Calendar Column */}
        <div className="w-full lg:w-[350px] shrink-0 border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-md shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft size={16} className="text-white/70" />
            </button>
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-white">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight size={16} className="text-white/70" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-[9px] font-mono uppercase tracking-widest text-white/40">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const isSelected = isSameDay(day, selectedDate);
              const isPast = isBefore(day, today);
              const isCurrentMonth = isSameMonth(day, monthStart);
              
              return (
                <button
                  key={idx}
                  onClick={() => !isPast && setSelectedDate(day)}
                  disabled={isPast}
                  className={`
                    h-8 flex items-center justify-center rounded-lg text-[13px] font-sans transition-all
                    ${!isCurrentMonth ? "text-white/30" : ""}
                    ${isPast ? "text-white/20 cursor-not-allowed opacity-50" : "hover:border-white hover:bg-white/10 border border-transparent"}
                    ${isSelected ? "bg-white text-black font-bold shadow-sm" : "text-white"}
                    ${isToday(day) && !isSelected ? "text-white/70 font-bold" : ""}
                  `}
                >
                  {format(day, dateFormat)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slots Column */}
        <div className="flex-1">
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              Available slots for
            </span>
            <div className="font-display text-lg text-white font-black uppercase">
              {format(selectedDate, "EEEE, MMMM d")}
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                onClick={() => slot.status === "AVAILABLE" && toggleSlot(slot.id)}
                className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border backdrop-blur-sm
                  ${
                    slot.status === "BOOKED"
                      ? "border-white/5 bg-white/5 cursor-not-allowed opacity-40 text-white/30"
                      : selectedSlots.includes(slot.id)
                      ? "border-white bg-white text-black shadow-sm scale-[0.98]"
                      : "border-white/10 hover:border-white/50 bg-white/5 text-white hover:bg-white/10 shadow-sm"
                  }
                `}
              >
                <span className="font-mono font-bold tracking-tight mb-1 text-[11px] whitespace-nowrap">{slot.time}</span>
                {slot.status === "BOOKED" ? (
                  <span className="text-[9px] uppercase tracking-widest text-white/40">Booked</span>
                ) : (
                  <span className={`text-[9px] uppercase tracking-widest ${selectedSlots.includes(slot.id) ? 'text-black/70' : 'text-white/60 font-bold'}`}>Available</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 items-center">
        <button 
          onClick={onBack}
          className="h-[50px] px-8 bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white font-bold tracking-widest uppercase transition-colors rounded-xl text-xs"
        >
          Back
        </button>
        <div className="flex-1 text-center font-mono text-[10px] text-white/50 uppercase tracking-widest">
          {selectedSlots.length} hr(s) selected
        </div>
        <button 
          onClick={handleContinue} 
          disabled={selectedSlots.length === 0} 
          className="h-[50px] px-8 bg-white text-black hover:bg-white/90 font-bold tracking-widest uppercase transition-all rounded-xl text-xs shadow-sm transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
