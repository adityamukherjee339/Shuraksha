"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRealtimeAlerts } from "@/hooks/use-realtime-alerts";

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const { alerts, loading } = useRealtimeAlerts();

  if (!user) return null;

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const myRespondedAlerts = alerts.filter((a) =>
    a.responders?.some((r) => r.volunteerId === user.id)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user.name} 🦸
        </h1>
        <p className="text-gray-500 mt-1">
          {user.isVerified ? "✅ Verified Volunteer" : "⏳ Pending Verification"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl mb-1 font-bold text-red-500">
            {activeAlerts.length}
          </div>
          <div className="text-xs text-gray-500">Active Alerts Nearby</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-1 font-bold text-blue-500">
            {user.isVerified ? "🟢" : "🟡"}
          </div>
          <div className="text-xs text-gray-500">
            {user.isVerified ? "Active" : "Unverified"}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-1 font-bold">
            {myRespondedAlerts.length}
          </div>
          <div className="text-xs text-gray-500">Your Responses</div>
        </Card>
      </div>

      {!user.isVerified && (
        <Card className="bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⏳ Your volunteer account is pending admin verification. You will be
            able to respond to emergencies once verified.
          </p>
        </Card>
      )}

      {/* Active Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            🚨 Active Emergencies
          </h2>
          <Link href="/volunteer/alerts">
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : activeAlerts.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <div className="text-4xl mb-3">🛡️</div>
            <p className="text-gray-500 font-medium">No active emergencies</p>
            <p className="text-sm text-gray-400 mt-1">
              You&apos;ll be notified when someone needs help nearby
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeAlerts.slice(0, 5).map((alert) => {
              const hasResponded = alert.responders?.some(
                (r) => r.volunteerId === user.id
              );
              return (
                <Card key={alert.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-medium text-gray-900">
                          {alert.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {alert.phone}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                      {alert.details && (
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.details}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        📍 {alert.location.lat.toFixed(4)},{" "}
                        {alert.location.lng.toFixed(4)}
                      </p>
                    </div>
                    <Link href="/volunteer/alerts">
                      <Button
                        variant={hasResponded ? "success" : "primary"}
                        size="sm"
                      >
                        {hasResponded ? "Responded" : "Respond"}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* My Recent Responses */}
      {myRespondedAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            📋 Your Recent Responses
          </h2>
          <div className="space-y-2">
            {myRespondedAlerts.slice(0, 3).map((alert) => {
              const myResponse = alert.responders?.find(
                (r) => r.volunteerId === user.id
              );
              return (
                <Card key={alert.id} padding="sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {alert.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {alert.status}
                      </span>
                    </div>
                    <span className="text-xs font-medium capitalize text-gray-500">
                      {myResponse?.status.replace("_", " ")}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
