"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportData {
  alerts: {
    total: number;
    active: number;
    resolved: number;
    avgResponseTimeSeconds: number;
  };
  users: {
    total: number;
    women: number;
    parents: number;
    volunteers: number;
    verifiedVolunteers: number;
    admins: number;
  };
  safetyZones: {
    total: number;
    byType: Record<string, number>;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard 👑
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome, {user.name} — System Overview
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          Loading dashboard...
        </div>
      ) : report ? (
        <>
          {/* Alert Stats */}
          <Card>
            <CardHeader>
              <CardTitle>🚨 Emergency Alerts</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {report.alerts.total}
                </div>
                <div className="text-xs text-gray-500">Total Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {report.alerts.active}
                </div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {report.alerts.resolved}
                </div>
                <div className="text-xs text-gray-500">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {report.alerts.avgResponseTimeSeconds}s
                </div>
                <div className="text-xs text-gray-500">Avg Response</div>
              </div>
            </div>
          </Card>

          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle>👥 Users</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {report.users.total}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500">
                  {report.users.women}
                </div>
                <div className="text-xs text-gray-500">Women</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {report.users.parents}
                </div>
                <div className="text-xs text-gray-500">Parents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {report.users.verifiedVolunteers}/{report.users.volunteers}
                </div>
                <div className="text-xs text-gray-500">Verified Volunteers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">
                  {report.users.admins}
                </div>
                <div className="text-xs text-gray-500">Admins</div>
              </div>
            </div>
          </Card>

          {/* Safety Zones */}
          <Card>
            <CardHeader>
              <CardTitle>📍 Safety Zones ({report.safetyZones.total})</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(report.safetyZones.byType).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {count}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {type.replace("_", " ")}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card className="text-center py-8 text-gray-400">
          Could not load report data
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <Card hover className="text-center">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-900">Manage Users</h3>
            <p className="text-xs text-gray-500 mt-1">
              View and manage all registered users
            </p>
          </Card>
        </Link>
        <Link href="/admin/volunteers">
          <Card hover className="text-center">
            <div className="text-3xl mb-2">🦸</div>
            <h3 className="font-semibold text-gray-900">Volunteers</h3>
            <p className="text-xs text-gray-500 mt-1">
              Verify and manage volunteer accounts
            </p>
          </Card>
        </Link>
        <Link href="/admin/alerts">
          <Card hover className="text-center">
            <div className="text-3xl mb-2">🚨</div>
            <h3 className="font-semibold text-gray-900">Alerts Monitor</h3>
            <p className="text-xs text-gray-500 mt-1">
              Monitor all emergency alerts in real-time
            </p>
          </Card>
        </Link>
        <Link href="/admin/zones">
          <Card hover className="text-center">
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-semibold text-gray-900">Safety Zones</h3>
            <p className="text-xs text-gray-500 mt-1">
              Manage police stations, hospitals, safe houses
            </p>
          </Card>
        </Link>
        <Link href="/admin/reports">
          <Card hover className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900">Reports</h3>
            <p className="text-xs text-gray-500 mt-1">
              Generate incident and performance reports
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
