"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Map } from "@/components/ui/map";
import type { MapMarker } from "@/types";

interface SafetyZone {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  resources: string[];
}

const typeColors: Record<string, { label: string; color: string; icon: string }> = {
  police: { label: "Police Station", color: "blue", icon: "🚔" },
  hospital: { label: "Hospital", color: "red", icon: "🏥" },
  community_center: { label: "Community Center", color: "orange", icon: "🏛️" },
  safe_house: { label: "Safe House", color: "green", icon: "🏠" },
};

const typeIcons: Record<string, MapMarker["icon"]> = {
  police: "blue",
  hospital: "red",
  community_center: "orange",
  safe_house: "green",
};

export default function SafeZonesPage() {
  const [zones, setZones] = useState<SafetyZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/safety-zones")
      .then((r) => r.json())
      .then((data) => {
        setZones(data.zones || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  const filteredZones = filter === "all" ? zones : zones.filter((z) => z.type === filter);

  const markers: MapMarker[] = [
    ...(userLocation
      ? [
          {
            id: "you",
            lat: userLocation.lat,
            lng: userLocation.lng,
            title: "You are here",
            type: "user" as const,
            icon: "green" as const,
          },
        ]
      : []),
    ...filteredZones.map((z) => ({
      id: z.id,
      lat: z.lat,
      lng: z.lng,
      title: z.name,
      description: z.address,
      type: z.type === "police" ? ("safe" as const) : ("safe" as const),
      icon: typeIcons[z.type] || "blue",
    })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🗺️ Safe Zones</h1>
        <p className="text-gray-500 mt-1">
          Find nearby police stations, hospitals, and safe houses
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All", icon: "📍" },
          { key: "police", label: "Police", icon: "🚔" },
          { key: "hospital", label: "Hospitals", icon: "🏥" },
          { key: "safe_house", label: "Safe Houses", icon: "🏠" },
          { key: "community_center", label: "Community", icon: "🏛️" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <Card padding="none" className="overflow-hidden">
        <Map
          markers={markers}
          height="400px"
          showUserLocation={false}
          center={userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629]}
          zoom={12}
        />
      </Card>

      {/* Zone List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredZones.map((zone) => {
            const info = typeColors[zone.type] || {
              label: zone.type,
              color: "gray",
              icon: "📍",
            };
            return (
              <Card key={zone.id}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{info.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{info.label}</p>
                    <p className="text-sm text-gray-600 mt-1">{zone.address}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{zone.phone}</p>
                    {zone.resources.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {zone.resources.map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
