"use client";

import React from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeAlerts } from "@/hooks/use-realtime-alerts";

export default function ParentDashboard() {
  const { user } = useAuth();
  const { alerts, loading } = useRealtimeAlerts();

  if (!user) return null;

  const activeAlerts = alerts.filter((a) => a.status === "active");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user.name} 👨‍👩‍👧
        </h1>
        <p className="text-gray-500 mt-1">
          Monitoring safety for{" "}
          <span className="font-semibold text-gray-700">
            {user.linkedDaughter || "your daughter"}
          </span>
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl mb-1 font-bold">
            {activeAlerts.length > 0 ? (
              <span className="text-red-500">{activeAlerts.length}</span>
            ) : (
              <span className="text-green-500">0</span>
            )}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Active Alerts
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-1 font-bold text-gray-700">
            {alerts.length}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Total Alerts
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-1">
            {activeAlerts.length > 0 ? "🔴" : "🟢"}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {activeAlerts.length > 0 ? "Alert Active" : "All Safe"}
          </div>
        </Card>
      </div>

      {/* Active Alert */}
      {activeAlerts.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">
              🚨 EMERGENCY ALERT ACTIVE
            </CardTitle>
          </CardHeader>
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="space-y-2">
              <p className="text-sm text-red-700 font-medium">
                Alert triggered at{" "}
                {new Date(alert.createdAt).toLocaleString()}
              </p>
              {alert.details && (
                <p className="text-sm text-gray-700">{alert.details}</p>
              )}
              <p className="text-xs text-gray-500">
                Location: {alert.location.lat.toFixed(4)},{" "}
                {alert.location.lng.toFixed(4)}
              </p>
              {alert.responders.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    Responders:
                  </p>
                  {alert.responders.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <span>🦸 {r.volunteerName}</span>
                      <span className="text-xs text-gray-400 capitalize">
                        ({r.status.replace("_", " ")})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-yellow-700">
                  ⏳ No responder has accepted yet
                </p>
              )}
            </div>
          ))}
        </Card>
      )}

      {/* All Clear */}
      {activeAlerts.length === 0 && !loading && (
        <Card padding="lg" className="text-center py-12">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            All Clear
          </h2>
          <p className="text-gray-500">
            {user.linkedDaughter
              ? `${user.linkedDaughter} is safe`
              : "Your daughter is safe"}{" "}
            — no active emergencies
          </p>
        </Card>
      )}

      {/* Alert History */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Alert History
          </h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <Card key={alert.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        alert.status === "active"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {alert.status}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {alert.responders.length} responder(s)
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-400">
          Loading safety status...
        </div>
      )}
    </div>
  );
}
