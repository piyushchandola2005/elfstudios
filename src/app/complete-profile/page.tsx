"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.push("/login");
        return;
      }
      
      // If they already have a phone number, redirect them
      if (user.user_metadata?.phone) {
        router.push("/book");
        return;
      }
      
      // Pre-fill name from Google if available
      if (user.user_metadata?.full_name) {
        setName(user.user_metadata.full_name);
      }
      setLoading(false);
    });
  }, [supabase.auth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          phone: phone,
        }
      });
      
      if (error) throw error;
      
      router.push("/book");
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your profile.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white text-xs uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-8 bg-white">
      <div className="w-full max-w-[1000px] bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-black/10">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[700px]">
          
          {/* Left Side - Form */}
          <div className="flex flex-col items-center justify-center p-6 lg:p-10 relative bg-white">
            
            <div className="w-full max-w-[420px] space-y-8">
              <div className="text-center flex flex-col items-center space-y-2">
                <Image 
                  src="/assets/ELF JAMPAD black.png" 
                  alt="Elf Jampad Logo" 
                  width={150} 
                  height={50} 
                  className="mb-8 object-contain mx-auto"
                />
                <h1 className="text-[32px] font-display font-black tracking-tighter uppercase text-black">
                  Complete Setup
                </h1>
                <p className="text-gray-500 font-sans text-sm">
                  We just need a couple more details to finalize your account and get you ready for booking.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                {error && <div className="text-red-500 text-sm font-sans text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full h-[50px] bg-white border border-gray-200 rounded-xl px-4 text-black focus:outline-none focus:border-elf-orange transition-colors font-sans text-[15px] shadow-sm"
                    />
                  </div>
                  
                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full h-[50px] bg-white border border-gray-200 rounded-xl px-4 text-black focus:outline-none focus:border-elf-orange transition-colors font-sans text-[15px] shadow-sm"
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full h-[50px] bg-black text-white hover:bg-elf-orange hover:text-black font-bold tracking-widest uppercase transition-colors rounded-xl text-xs mt-4 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Continue to Booking"}
                  </button>
                </form>

              </div>
            </div>
          </div>

          {/* Right Side - Image Section */}
          <div className="relative lg:rounded-[2rem] m-0 lg:m-4 overflow-hidden hidden lg:block">
            {/* Background Image */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: 'url("/assets/A7R09009.jpg")' }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Bottom Caption/Description Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-black text-xl uppercase tracking-widest text-white">
                Zero Compromises
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed font-sans">
                Experience world-class acoustics, premium backline equipment, and a seamless booking experience. Your sonic journey starts here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
