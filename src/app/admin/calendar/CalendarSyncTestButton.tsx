"use client";

import { useState } from "react";

export function CalendarSyncTestButton({ configured }: { configured: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createTestEvent() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/google-calendar/test", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create test event.");
      setMessage(`Blue test event created for ${new Intl.DateTimeFormat("en-IN", { timeStyle: "short", dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(data.event.start))}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create test event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={createTestEvent}
        disabled={!configured || loading}
        className="rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating test event…" : "Create blue Calendar test"}
      </button>
      {!configured && <p className="mt-2 text-xs text-amber-700">Add the Google Calendar environment variables in Vercel to enable this test.</p>}
      {message && <p role="status" className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
