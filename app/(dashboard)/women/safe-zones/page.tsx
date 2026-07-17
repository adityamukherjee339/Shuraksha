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

// Haversine formula to calculate distance in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

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

    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }
    
    return () => {
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const filteredZones = filter === "all" ? zones : zones.filter((z) => z.type === filter);

  let sortedZones = filteredZones.map(z => ({ ...z, distance: -1 })); // -1 means distance unknown
  if (userLocation) {
    sortedZones = filteredZones
      .map(z => ({
        ...z,
        distance: getDistance(userLocation.lat, userLocation.lng, z.lat, z.lng)
      }))
      .filter(z => z.distance <= 20) // Only show within 20km
      .sort((a, b) => a.distance - b.distance);
  }

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
    ...sortedZones.map((z) => ({
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
      ) : sortedZones.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-4xl mb-3">🕵️‍♀️</div>
          <h3 className="text-lg font-medium text-gray-900">No safe zones found nearby</h3>
          <p className="text-gray-500 mt-1 max-w-md mx-auto">
            We couldn't find any verified safe zones within 20km of your current location. 
            In an emergency, please use the SOS button immediately.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {sortedZones.map((zone) => {
            const info = typeColors[zone.type] || {
              label: zone.type,
              color: "gray",
              icon: "📍",
            };
            
            let distanceText = "";
            if (zone.distance !== -1) {
              distanceText = zone.distance < 1 ? `${(zone.distance * 1000).toFixed(0)} m away` : `${zone.distance.toFixed(1)} km away`;
            }

            return (
              <Card key={zone.id}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{info.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 pr-2">{zone.name}</h3>
                      {distanceText && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {distanceText}
                        </span>
                      )}
                    </div>
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
