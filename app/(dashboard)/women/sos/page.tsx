"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SOSButton } from "@/components/ui/sos-button";
import { useRouter } from "next/navigation";
import { useVoiceCommand } from "@/hooks/use-voice-command";


function getInitialLocationStatus(): "loading" | "error" {
  if (typeof navigator === "undefined" || !navigator.geolocation) return "error";
  return "loading";
}

export default function SOSPage() {
  const router = useRouter();
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "loading" | "ready" | "error"
  >(getInitialLocationStatus);
  const [lastAlert, setLastAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("ready");
      },
      () => {
        setLocationStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSOS = useCallback(
    async (details: string) => {
      if (!location) {
        alert("Location is required to send an SOS. Please enable GPS.");
        return;
      }

      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          details,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setLastAlert(data.alert?._id || data.alert?.id);
      } else {
        throw new Error(data.error || "Failed to send SOS");
      }
    },
    [location]
  );

  const { isListening, startListening, stopListening, error: voiceError } = useVoiceCommand(
    "help shuraksha",
    () => {
      // Trigger SOS on voice command
      handleSOS("Triggered via Voice Command");
    }
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">🚨 SOS Emergency</h1>
        <p className="text-gray-500 mt-1">
          Press the SOS button in case of an emergency
        </p>
      </div>

      {/* Location Status */}
      <Card>
        <CardHeader>
          <CardTitle>📍 Location Status</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-2">
          {locationStatus === "loading" && (
            <>
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-sm text-gray-600">
                Detecting your location...
              </span>
            </>
          )}
          {locationStatus === "ready" && (
            <>
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-green-700 font-medium">
                Location ready
              </span>
              <span className="text-xs text-gray-400 ml-2">
                ({location?.lat.toFixed(4)}, {location?.lng.toFixed(4)})
              </span>
            </>
          )}
          {locationStatus === "error" && (
            <>
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-red-600">
                Location unavailable. Enable GPS for SOS to work.
              </span>
            </>
          )}
        </div>
      </Card>

      {/* Voice Command Toggle */}
      <Card padding="lg" className="border-blue-200 bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">🎙️ Voice SOS</h3>
            <p className="text-sm text-blue-700">
              Say <span className="font-bold">"Help Shuraksha"</span> to trigger an alert automatically.
            </p>
            {voiceError && <p className="text-xs text-red-600 mt-1">{voiceError}</p>}
          </div>
          <button
            onClick={() => isListening ? stopListening() : startListening()}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isListening ? "bg-red-100 text-red-700" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isListening ? "Listening... (Stop)" : "Enable Voice SOS"}
          </button>
        </div>
      </Card>

      {/* SOS Button */}
      <div className="flex justify-center py-8">
        <SOSButton
          onTrigger={handleSOS}
          disabled={locationStatus === "loading"}
          hasLocation={locationStatus === "ready"}
        />
      </div>

      {/* Instructions */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>⚠️ When to use SOS</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">🚨</span>
            You feel threatened or unsafe in any situation
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">🚨</span>
            You are being followed or harassed
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">🚨</span>
            You are in a medical emergency
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">🚨</span>
            You witness someone else in danger
          </li>
        </ul>
      </Card>

      {/* What happens next */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>📋 What happens next?</CardTitle>
        </CardHeader>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>Your location and safety profile are sent to responders</li>
          <li>Nearby verified volunteers receive your alert</li>
          <li>Your emergency contacts are notified</li>
          <li>Volunteers can accept and respond to your alert</li>
          <li>Track responder status on this page</li>
        </ol>
      </Card>

      {lastAlert && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800 font-medium text-sm">
            ✅ SOS sent successfully! Help is on the way. You can track your alert in Alert History.
          </p>
          <button
            onClick={() => router.push("/women/history")}
            className="mt-2 text-sm font-medium text-green-700 underline"
          >
            View Alert Status →
          </button>
        </div>
      )}
    </div>
  );
}
