"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function WomenDashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => {}
      );
    }
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">Your safety dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl mb-1">
            {(user.contacts || []).length || "0"}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Emergency Contacts
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-1">
            {user.safetyProfile?.bloodGroup || "—"}
          </div>
          <div className="text-xs text-gray-500 font-medium">Blood Group</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-1">
            {location ? "✅" : "⚠️"}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {location ? "Location Active" : "No Location"}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-1">{user.phone}</div>
          <div className="text-xs text-gray-500 font-medium">Phone</div>
        </Card>
      </div>

      {/* SOS Quick Action */}
      <Link href="/women/sos">
        <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-2xl p-6 text-white shadow-lg hover:from-red-600 hover:to-red-800 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">🚨 Emergency SOS</h2>
              <p className="text-red-100 text-sm mt-1">
                Tap to trigger an emergency alert — help will be notified
                immediately
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/women/profile">
          <Card hover className="h-full">
            <CardHeader>
              <CardTitle>🛡️ Safety Profile</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Blood Group:</span>{" "}
                {user.safetyProfile?.bloodGroup || "Not set"}
              </p>
              <p>
                <span className="font-medium">Allergies:</span>{" "}
                {user.safetyProfile?.allergies || "None listed"}
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/women/contacts">
          <Card hover className="h-full">
            <CardHeader>
              <CardTitle>👥 Emergency Contacts</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {(user.contacts || []).length > 0 ? (
                <p className="text-sm font-medium text-gray-900">
                  {(user.contacts || []).length} Contacts Set
                </p>
              ) : (
                <p className="text-sm text-gray-400">No contacts added</p>
              )}
            </div>
          </Card>
        </Link>

        <Link href="/women/fake-call">
          <Card hover className="h-full bg-indigo-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-indigo-900">📱 Fake Call</CardTitle>
            </CardHeader>
            <p className="text-sm text-indigo-700">
              Schedule a fake incoming call to escape uncomfortable situations.
            </p>
          </Card>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/women/safe-zones">
          <Card hover>
            <CardHeader>
              <CardTitle>🗺️ Safe Zones</CardTitle>
            </CardHeader>
            <p className="text-sm text-gray-500">
              View nearby police stations, hospitals, and safe houses
            </p>
          </Card>
        </Link>

        <Link href="/women/history">
          <Card hover>
            <CardHeader>
              <CardTitle>📋 Alert History</CardTitle>
            </CardHeader>
            <p className="text-sm text-gray-500">
              View your past emergency alerts and their status
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
