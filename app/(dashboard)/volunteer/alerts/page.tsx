"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map } from "@/components/ui/map";
import type { MapMarker } from "@/types";

interface AlertData {
  _id: string;
  id: string;
  userId: string;
  name: string;
  phone: string;
  username: string;
  status: "active" | "resolved";
  createdAt: string;
  location: { lat: number; lng: number; address?: string };
  details: string;
  safetyProfile?: {
    bloodGroup: string;
    medicalNotes: string;
    allergies: string;
    emergencyNote: string;
  };
  contacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  responders: Array<{
    volunteerId: string;
    volunteerName: string;
    status: string;
    updatedAt: string;
    lat?: number;
    lng?: number;
  }>;
}

function formatTimeAgo(createdAt: string, now: number): string {
  const minutes = Math.round((now - new Date(createdAt).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 min ago";
  return `${minutes} min ago`;
}

export default function VolunteerAlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [myLocation, setMyLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setMyLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(tick);
  }, []);

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

  useEffect(() => {
    void (async () => {
      await fetchAlerts();
    })();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (
    alertId: string,
    action: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setActionLoading(alertId + action);
    try {
      await fetch(`/api/alerts/${alertId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          lat: myLocation?.lat,
          lng: myLocation?.lng,
        }),
      });
      await fetchAlerts();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || !user.isVerified) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card padding="lg" className="text-center py-12">
          <div className="text-4xl mb-3">⏳</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Verification Required
          </h2>
          <p className="text-gray-500">
            Your account is pending admin approval. You&apos;ll be able to
            respond to emergencies once verified.
          </p>
        </Card>
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const selectedAlertData = selectedAlert
    ? activeAlerts.find((a) => a._id === selectedAlert._id) || selectedAlert
    : null;

  const mapMarkers: MapMarker[] = [
    ...(myLocation
      ? [
          {
            id: "me",
            lat: myLocation.lat,
            lng: myLocation.lng,
            title: "You",
            type: "volunteer" as const,
            icon: "green" as const,
          },
        ]
      : []),
    ...activeAlerts.map((a) => ({
      id: a._id,
      lat: a.location.lat,
      lng: a.location.lng,
      title: a.name,
      description: a.details || "Emergency alert",
      type: "danger" as const,
      icon: "red" as const,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🚨 Emergency Alerts
          </h1>
          <p className="text-gray-500 mt-1">
            {activeAlerts.length} active alert(s) nearby
          </p>
        </div>
      </div>

      {/* Map */}
      {mapMarkers.length > 1 && (
        <Card padding="none" className="overflow-hidden">
          <Map
            markers={mapMarkers}
            height="300px"
            center={
              myLocation
                ? [myLocation.lat, myLocation.lng]
                : [20.5937, 78.9629]
            }
            zoom={13}
          />
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading alerts...</div>
      ) : activeAlerts.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <div className="text-4xl mb-3">🛡️</div>
          <p className="text-gray-500 font-medium">No active emergencies</p>
          <p className="text-sm text-gray-400 mt-1">
            Everything is calm right now. You&apos;ll be alerted when someone
            needs help.
          </p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Alert List */}
          <div className="space-y-3">
            {activeAlerts.map((alert) => {
              const myResponse = alert.responders?.find(
                (r) => r.volunteerId === user.id
              );
              const isSelected = selectedAlert?._id === alert._id;

              return (
                <Card
                  key={alert._id}
                  hover
                  onClick={() => setSelectedAlert(alert)}
                  className={`cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-primary border-primary" : ""
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-semibold text-gray-900">
                          {alert.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(alert.createdAt, now)}
                      </span>
                    </div>

                    {alert.details && (
                      <p className="text-sm text-gray-600">{alert.details}</p>
                    )}

                    <p className="text-xs text-gray-400">
                      📍 {alert.location.lat.toFixed(4)},{" "}
                      {alert.location.lng.toFixed(4)}
                    </p>

                    {!myResponse && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => handleRespond(alert._id, "accept", e)}
                          loading={actionLoading === alert._id + "accept"}
                        >
                          ✅ Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) =>
                            handleRespond(alert._id, "decline", e)
                          }
                          loading={actionLoading === alert._id + "decline"}
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    {myResponse && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {myResponse.status === "accepted" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) =>
                                handleRespond(alert._id, "en_route", e)
                              }
                              loading={
                                actionLoading === alert._id + "en_route"
                              }
                            >
                              🚗 En Route
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) =>
                                handleRespond(alert._id, "on_scene", e)
                              }
                              loading={
                                actionLoading === alert._id + "on_scene"
                              }
                            >
                              📍 On Scene
                            </Button>
                          </>
                        )}
                        {(myResponse.status === "en_route" ||
                          myResponse.status === "on_scene") && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={(e) =>
                              handleRespond(alert._id, "resolved", e)
                            }
                            loading={
                              actionLoading === alert._id + "resolved"
                            }
                          >
                            ✅ Resolved
                          </Button>
                        )}
                        <span className="text-xs text-gray-400 capitalize self-center ml-1">
                          Status: {myResponse.status.replace("_", " ")}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Alert Detail */}
          {selectedAlertData && (
            <div className="space-y-3">
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>
                    👤 {selectedAlertData.name}
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      {selectedAlertData.phone}
                    </span>
                  </CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  {selectedAlertData.safetyProfile && (
                    <>
                      <h4 className="text-sm font-semibold text-gray-700">
                        🩺 Medical Profile
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Blood:</span>{" "}
                          {selectedAlertData.safetyProfile.bloodGroup || "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-400">Allergies:</span>{" "}
                          {selectedAlertData.safetyProfile.allergies || "None"}
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Medical:</span>{" "}
                          {selectedAlertData.safetyProfile.medicalNotes ||
                            "N/A"}
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Emergency Note:</span>{" "}
                          {selectedAlertData.safetyProfile.emergencyNote ||
                            "N/A"}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedAlertData.contacts &&
                    selectedAlertData.contacts.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold text-gray-700 mt-3">
                          👥 Emergency Contacts
                        </h4>
                        {selectedAlertData.contacts.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm">{c.name}</span>
                            <span className="text-xs text-gray-400">
                              {c.relationship} · {c.phone}
                            </span>
                          </div>
                        ))}
                      </>
                    )}

                  <h4 className="text-sm font-semibold text-gray-700 mt-3">
                    🦸 Responders
                  </h4>
                  {selectedAlertData.responders.length > 0 ? (
                    selectedAlertData.responders.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                      >
                        <span>{r.volunteerName}</span>
                        <span className="text-xs capitalize text-gray-500">
                          {r.status.replace("_", " ")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-yellow-600">
                      ⏳ No responder has accepted yet
                    </p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
