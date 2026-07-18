"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./map-component"), { ssr: false });

export default function SafeRoutesPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [assessment, setAssessment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeRoute = async () => {
    if (!start || !end) return;
    setLoading(true);
    setAssessment(null);
    try {
      const res = await fetch("/api/ai/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startStr: start, endStr: end }),
      });
      const data = await res.json();
      if (data.assessment) setAssessment(data.assessment);
    } catch (e) {
      console.error(e);
      setAssessment("Failed to analyze route. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🗺️ Safe Routing</h1>
      <p className="text-gray-500">AI-powered safe route analysis for your journey.</p>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Journey</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Start Location</label>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                  <MapPin size={16} className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    value={start} 
                    onChange={e => setStart(e.target.value)}
                    placeholder="e.g. Current Location"
                    className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Destination</label>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                  <Navigation size={16} className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    value={end} 
                    onChange={e => setEnd(e.target.value)}
                    placeholder="e.g. Central Station"
                    className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900"
                  />
                </div>
              </div>
              <button 
                onClick={analyzeRoute}
                disabled={loading || !start || !end}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Analyzing Safety..." : "Analyze Route Safety"}
              </button>
            </div>
          </Card>

          {assessment && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
                  🛡️ AI Safety Assessment
                </CardTitle>
              </CardHeader>
              <div className="p-6 pt-0 text-sm text-blue-800 leading-relaxed">
                {assessment}
              </div>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-2 h-[500px] rounded-xl overflow-hidden border shadow-sm z-0">
           <Map />
        </div>
      </div>
    </div>
  );
}
