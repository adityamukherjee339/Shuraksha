import { useState, useEffect } from "react";
import type { EmergencyAlert } from "@/types";

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const res = await fetch("/api/alerts");
        const data = await res.json();
        if (isMounted) {
          setAlerts(data.alerts || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch initial alerts", err);
        if (isMounted) setLoading(false);
      }
    };

    const connectSSE = () => {
      eventSource = new EventSource("/api/alerts/stream");

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "alert_update" && data.alert) {
            setAlerts((prev) => {
              const existingIndex = prev.findIndex(a => a.id === data.alert.id);
              if (existingIndex >= 0) {
                const newAlerts = [...prev];
                newAlerts[existingIndex] = data.alert;
                return newAlerts;
              } else {
                return [data.alert, ...prev];
              }
            });
          }
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };

      eventSource.onerror = () => {
        console.error("SSE connection lost, reconnecting...");
        eventSource?.close();
        setTimeout(() => {
          if (isMounted) connectSSE();
        }, 5000);
      };
    };

    fetchInitial().then(() => {
      if (isMounted) connectSSE();
    });

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return { alerts, loading };
}
