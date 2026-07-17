"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/card";

interface AlertData {
  _id: string;
  id: string;
  status: "active" | "resolved";
  createdAt: string;
  location: { lat: number; lng: number; address?: string };
  details: string;
  responders: Array<{
    volunteerName: string;
    volunteerPhone: string;
    status: string;
    updatedAt: string;
  }>;
}

const statusColors: Record<string, string> = {
  active: "bg-red-100 text-red-700",
  resolved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  en_route: "bg-orange-100 text-orange-700",
  on_scene: "bg-purple-100 text-purple-700",
  declined: "bg-gray-100 text-gray-500",
};

export default function AlertHistoryPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts");
        const data = await res.json();
        setAlerts(data.alerts || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📋 Alert History</h1>
        <p className="text-gray-500 mt-1">
          Your past emergency alerts and their current status
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-500 font-medium">No alerts yet</p>
          <p className="text-sm text-gray-400 mt-1">
            You haven&apos;t triggered any SOS alerts
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert._id || alert.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[alert.status] || ""
                    }`}
                  >
                    {alert.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <div className="space-y-3">
                {alert.details && (
                  <p className="text-sm text-gray-600">{alert.details}</p>
                )}
                <p className="text-xs text-gray-400">
                  Location: {alert.location.lat.toFixed(4)},{" "}
                  {alert.location.lng.toFixed(4)}
                  {alert.location.address && ` - ${alert.location.address}`}
                </p>

                {alert.responders.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Responders:
                    </p>
                    <div className="space-y-1">
                      {alert.responders.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              {r.volunteerName}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              {r.volunteerPhone}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              statusColors[r.status] || ""
                            }`}
                          >
                            {r.status.replace("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {alert.responders.length === 0 &&
                  alert.status === "active" && (
                    <p className="text-sm text-yellow-600">
                      ⏳ Waiting for a responder to accept...
                    </p>
                  )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
