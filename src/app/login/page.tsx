"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Check if phone number is missing, redirect to complete-profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !user.user_metadata?.phone) {
          router.push("/complete-profile");
        } else {
          router.push("/book");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "An error occurred with Google Sign In.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-8 bg-white">
      <div className="w-full max-w-[1000px] bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-black/10">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[700px]">
          
          {/* Left Side - Auth Form */}
          <div className="flex flex-col items-center justify-center p-6 lg:p-10 relative bg-white">
            <a href="https://www.elfstudios.in/elf-jampad" className="absolute top-8 left-8 text-gray-400 hover:text-black font-mono text-xs tracking-widest uppercase transition-colors">
              &lt; Back to Home
            </a>
            
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
                  Access Portal
                </h1>
                <p className="text-gray-500 font-sans text-sm">
                  {isLogin ? "Sign in to book your jam session." : "Create an account to book your jam session."}
                </p>
              </div>

              <div className="space-y-4 pt-4">
                {/* Google Auth Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full h-[50px] bg-white border border-gray-200 hover:bg-gray-50 text-black rounded-xl font-bold flex items-center justify-center transition-colors font-sans text-sm shadow-sm"
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {isLogin ? "Continue with Google" : "Sign up with Google"}
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-mono">
                    <span className="bg-white px-2 text-gray-400">Or continue with email</span>
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm font-sans text-center">{error}</div>}
                {message && <div className="text-green-600 text-sm font-sans text-center">{message}</div>}

                <form onSubmit={handleAuth} className="space-y-4">
                  
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Name Input */}
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          required={!isLogin}
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
                          required={!isLogin}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full h-[50px] bg-white border border-gray-200 rounded-xl px-4 text-black focus:outline-none focus:border-elf-orange transition-colors font-sans text-[15px] shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full h-[50px] bg-white border border-gray-200 rounded-xl px-4 text-black focus:outline-none focus:border-elf-orange transition-colors font-sans text-[15px] shadow-sm"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-[50px] bg-white border border-gray-200 rounded-xl px-4 text-black focus:outline-none focus:border-elf-orange transition-colors font-sans text-[15px] shadow-sm"
                    />
                  </div>

                  {/* Auth Button */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-[50px] bg-black text-white hover:bg-elf-orange hover:text-black font-bold tracking-widest uppercase transition-colors rounded-xl text-xs mt-2 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
                  </button>
                </form>

                {/* Toggle Sign In / Sign Up */}
                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                      setMessage("");
                    }}
                    className="text-[12px] font-sans text-gray-500 hover:text-black transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>

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
