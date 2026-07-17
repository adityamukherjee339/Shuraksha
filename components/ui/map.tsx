"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapMarker } from "@/types";
import { renderToString } from "react-dom/server";
import { AlertTriangle, ShieldCheck, User as UserIcon, HeartHandshake, LocateFixed, MapPin } from "lucide-react";

export type { MapMarker };

// Fix Leaflet icon issue with bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createCustomIcon = (iconElement: React.ReactNode, colorClass: string) => {
  return L.divIcon({
    html: renderToString(
      <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border-2 ${colorClass}`}>
        {iconElement}
      </div>
    ),
    className: "custom-leaflet-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const redIcon = createCustomIcon(<AlertTriangle size={18} className="text-red-600" />, "border-red-600");
const blueIcon = createCustomIcon(<UserIcon size={18} className="text-blue-600" />, "border-blue-600");
const greenIcon = createCustomIcon(<ShieldCheck size={18} className="text-green-600" />, "border-green-600");
const orangeIcon = createCustomIcon(<HeartHandshake size={18} className="text-orange-600" />, "border-orange-600");
const defaultIcon = createCustomIcon(<MapPin size={18} className="text-gray-600" />, "border-gray-600");

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  className?: string;
  showUserLocation?: boolean;
  onLocationFound?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

const iconMap: Record<string, L.DivIcon> = {
  red: redIcon,
  blue: blueIcon,
  green: greenIcon,
  orange: orangeIcon,
};

export function Map({
  center = [20.5937, 78.9629],
  zoom = 5,
  markers = [],
  height = "400px",
  className = "",
  showUserLocation = false,
  onLocationFound,
  interactive = true,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const onLocationFoundRef = useRef(onLocationFound);

  useEffect(() => {
    onLocationFoundRef.current = onLocationFound;
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add Locate Control
    const LocateControl = L.Control.extend({
      options: {
        position: 'bottomright'
      },
      onAdd: function (map: L.Map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom bg-white flex items-center justify-center rounded-md shadow-md cursor-pointer hover:bg-gray-50 transition-colors');
        container.style.width = '34px';
        container.style.height = '34px';
        container.innerHTML = renderToString(<LocateFixed size={20} className="text-gray-700" />);
        
        container.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                map.setView([latitude, longitude], 15);
                if (onLocationFoundRef.current) {
                  onLocationFoundRef.current(latitude, longitude);
                }
                if (userMarkerRef.current) {
                  userMarkerRef.current.setLatLng([latitude, longitude]);
                } else {
                  userMarkerRef.current = L.marker([latitude, longitude], {
                    icon: blueIcon,
                  }).addTo(map).bindPopup("You are here").openPopup();
                }
              },
              () => console.log("Could not get location")
            );
          }
        }
        return container;
      }
    });
    map.addControl(new LocateControl());

    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 14);

          if (onLocationFoundRef.current) {
            onLocationFoundRef.current(latitude, longitude);
          }

          userMarkerRef.current = L.marker([latitude, longitude], {
            icon: blueIcon,
          })
            .addTo(map)
            .bindPopup("You are here")
            .openPopup();
        },
        () => {
          console.log("Could not get location");
        }
      );
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when they change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker) => {
      const icon = marker.icon
        ? iconMap[marker.icon]
        : marker.type === "danger"
        ? redIcon
        : marker.type === "safe"
        ? greenIcon
        : marker.type === "user"
        ? blueIcon
        : marker.type === "volunteer"
        ? orangeIcon
        : defaultIcon;

      const m = L.marker([marker.lat, marker.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<strong>${marker.title}</strong>${
            marker.description ? `<br/>${marker.description}` : ""
          }`
        );

      markersRef.current.push(m);
    });

    // Fit bounds if we have markers
    if (markers.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1), { maxZoom: 15 });
    }
  }, [markers]);

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden border border-gray-200 ${className}`}
      style={{ height, width: "100%" }}
    />
  );
}
