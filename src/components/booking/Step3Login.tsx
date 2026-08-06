import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step3Login({ onNext, onBack }: Step3Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="font-display text-lg uppercase tracking-widest text-elf-orange">
          3. Account
        </h2>
        <p className="font-sans text-[0.8rem] text-gray-400">
          You must be logged in to complete your booking. Your details will be securely saved.
        </p>
      </div>

      <div className="border border-white/20 bg-white/5 p-6 flex flex-col items-center justify-center space-y-4">
        {loading ? (
          <p className="font-mono text-[0.7rem] text-gray-500 uppercase">Loading session...</p>
        ) : user ? (
          <div className="text-center space-y-2">
            <p className="font-mono text-[0.7rem] text-elf-orange">Logged in as</p>
            <p className="font-display text-lg uppercase">{user.email?.split("@")[0]}</p>
            <p className="font-sans text-[0.8rem] text-gray-400">{user.email}</p>
          </div>
        ) : (
          <div className="text-center space-y-4 w-full max-w-sm">
            <p className="font-mono text-[0.75rem] text-gray-300">Sign in to continue</p>
            <Button fullWidth onClick={() => router.push("/login")} className="flex items-center justify-center gap-2">
              <span>Go to Login</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!user}>
          Continue to Details
        </Button>
      </div>
    </div>
  );
}
