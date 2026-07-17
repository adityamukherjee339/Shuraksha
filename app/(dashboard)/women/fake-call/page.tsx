"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function FakeCallPage() {
  const router = useRouter();
  const [callerName, setCallerName] = useState("Dad");
  const [timer, setTimer] = useState(10);
  const [status, setStatus] = useState<"idle" | "counting" | "ringing" | "ongoing">("idle");
  const [timeLeft, setTimeLeft] = useState(10);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "counting" && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (status === "counting" && timeLeft === 0) {
      setStatus("ringing");
      // Optional: Play ringtone here
    }
    return () => clearInterval(interval);
  }, [status, timeLeft]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "ongoing") {
      interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const startFakeCall = () => {
    setTimeLeft(timer);
    setStatus("counting");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Full Screen Ringing/Call UI
  if (status === "ringing" || status === "ongoing") {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-between py-12 px-6">
        <div className="text-center mt-12">
          <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-3xl text-white mb-2">{callerName}</h2>
          <p className="text-slate-400">
            {status === "ringing" ? "Incoming call..." : formatTime(callDuration)}
          </p>
        </div>

        <div className="w-full max-w-sm flex justify-around mb-12">
          {status === "ringing" && (
            <button
              onClick={() => setStatus("ongoing")}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-green-500/50"
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
              </svg>
            </button>
          )}

          <button
            onClick={() => router.push("/women")}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50"
          >
            <svg className="w-8 h-8 text-white rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">📱 Fake Call Simulator</h1>
        <p className="text-gray-500 mt-1">
          Schedule a realistic fake incoming call to excuse yourself from uncomfortable situations.
        </p>
      </div>

      <Card padding="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caller Name
            </label>
            <input
              type="text"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              disabled={status !== "idle"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time delay (seconds)
            </label>
            <input
              type="number"
              value={timer}
              onChange={(e) => setTimer(Number(e.target.value))}
              min="1"
              max="60"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              disabled={status !== "idle"}
            />
          </div>

          <div className="pt-2">
            {status === "idle" ? (
              <Button onClick={startFakeCall} className="w-full" variant="primary">
                Schedule Fake Call
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-lg font-bold text-red-600 mb-2">
                  Call arriving in {timeLeft}s...
                </p>
                <Button onClick={() => setStatus("idle")} className="w-full" variant="ghost">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
