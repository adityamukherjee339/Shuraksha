"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function useAnomalyDetection() {
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const locationHistory = useRef<{ lat: number; lng: number; time: number }[]>([]);
  const promptTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let watchId: number;
    
    const checkAnomaly = async () => {
       const history = locationHistory.current;
       if (history.length < 5) return;
       
       const last = history[history.length - 1];
       const first = history[0];
       const timeStopped = (last.time - first.time) / 1000;
       
       try {
         const res = await fetch("/api/ai/anomaly", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             locations: history,
             timeStopped,
             maxSpeed: 0,
           })
         });
         const data = await res.json();
         if (data.isAnomaly) {
           setShowPrompt(true);
           promptTimer.current = setTimeout(() => {
              triggerSOS();
           }, 60000); // 60 seconds
         }
       } catch(e) {
         console.error(e);
       }
       
       locationHistory.current = [];
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          locationHistory.current.push({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            time: Date.now()
          });
          
          // Check every 5 pings
          if (locationHistory.current.length >= 5) {
            checkAnomaly();
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }

    return () => {
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (promptTimer.current) clearTimeout(promptTimer.current);
    };
  }, []);

  const triggerSOS = async () => {
     setShowPrompt(false);
     if (promptTimer.current) clearTimeout(promptTimer.current);
     
     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(async (pos) => {
          await fetch("/api/alerts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              details: "Triggered automatically by AI Anomaly Detection",
            }),
          });
          router.push("/women/sos");
       });
     }
  };

  const cancelPrompt = () => {
    setShowPrompt(false);
    if (promptTimer.current) clearTimeout(promptTimer.current);
  };

  return { showPrompt, cancelPrompt };
}
