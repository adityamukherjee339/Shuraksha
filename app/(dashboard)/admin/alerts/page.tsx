"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AlertData {
  _id: string;
  name: string;
  username: string;
  phone: string;
  status: "active" | "resolved";
  createdAt: string;
  location: { lat: number; lng: number };
  details: string;
  responders: Array<{
    volunteerName: string;
    status: string;
  }>;
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/admin/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchAlerts();
    })();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🚨 Alerts Monitor</h1>
        <p className="text-gray-500 mt-1">
          {activeAlerts.length} active · {alerts.length - activeAlerts.length}{" "}
          resolved · {alerts.length} total
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <div className="text-4xl mb-3">🛡️</div>
          <p className="text-gray-500 font-medium">No alerts yet</p>
          <p className="text-sm text-gray-400 mt-1">
            The system hasn&apos;t recorded any emergency alerts
          </p>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-500">
                    User
                  </th>
                  <th className="text-left p-3 font-medium text-gray-500">
                    Contact
                  </th>
                  <th className="text-left p-3 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left p-3 font-medium text-gray-500">
                    Responders
                  </th>
                  <th className="text-left p-3 font-medium text-gray-500">
                    Location
                  </th>
                  <th className="text-left p-3 font-medium text-gray-500">
                    Time
                  </th>
                  <th className="text-right p-3 font-medium text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr
                    key={a._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      a.status === "active" ? "bg-red-50/50" : ""
                    }`}
                  >
                    <td className="p-3">
                      <p className="font-medium text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-400">@{a.username}</p>
                    </td>
                    <td className="p-3 text-gray-600">{a.phone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.status === "active"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {a.responders.length > 0
                        ? a.responders
                            .map((r) => r.volunteerName)
                            .join(", ")
                        : "—"}
                    </td>
                    <td className="p-3 text-xs text-gray-400">
                      {a.location.lat.toFixed(3)}, {a.location.lng.toFixed(3)}
                    </td>
                    <td className="p-3 text-xs text-gray-400">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {a.status === "active" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleResolve(a._id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
