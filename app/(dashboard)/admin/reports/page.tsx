"use client";

import React, { useState, useEffect } from "react";
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

export default function ReportsPage() {
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

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        Generating report...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12 text-gray-400">
        Could not load report data
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📊 Reports</h1>
        <p className="text-gray-500 mt-1">
          Incident and performance summary as of {new Date().toLocaleString()}
        </p>
      </div>

      {/* Alert Report */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>🚨 Emergency Alerts Report</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ReportStat
              label="Total Alerts"
              value={report.alerts.total}
              color="text-gray-900"
            />
            <ReportStat
              label="Active"
              value={report.alerts.active}
              color="text-red-500"
            />
            <ReportStat
              label="Resolved"
              value={report.alerts.resolved}
              color="text-green-500"
            />
            <ReportStat
              label="Avg Response"
              value={formatTime(report.alerts.avgResponseTimeSeconds)}
              color="text-blue-500"
            />
          </div>

          {/* Resolution Rate */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Resolution Rate</span>
              <span className="text-sm font-semibold">
                {report.alerts.total > 0
                  ? Math.round(
                      (report.alerts.resolved / report.alerts.total) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2 transition-all"
                style={{
                  width: `${
                    report.alerts.total > 0
                      ? (report.alerts.resolved / report.alerts.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* User Report */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>👥 User Report</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ReportStat
            label="Total Users"
            value={report.users.total}
            color="text-gray-900"
          />
          <ReportStat
            label="Women"
            value={report.users.women}
            color="text-pink-500"
          />
          <ReportStat
            label="Parents"
            value={report.users.parents}
            color="text-blue-500"
          />
          <ReportStat
            label="Volunteers"
            value={report.users.volunteers}
            color="text-orange-500"
          />
          <ReportStat
            label="Admins"
            value={report.users.admins}
            color="text-purple-500"
          />
        </div>

        {/* Volunteer Verification Rate */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">
              Volunteer Verification Rate
            </span>
            <span className="text-sm font-semibold">
              {report.users.volunteers > 0
                ? Math.round(
                    (report.users.verifiedVolunteers /
                      report.users.volunteers) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 rounded-full h-2 transition-all"
              style={{
                width: `${
                  report.users.volunteers > 0
                    ? (report.users.verifiedVolunteers /
                        report.users.volunteers) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {report.users.verifiedVolunteers} of {report.users.volunteers}{" "}
            volunteers verified
          </p>
        </div>
      </Card>

      {/* Safety Zone Report */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>📍 Safety Zones Report</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReportStat
            label="Total Zones"
            value={report.safetyZones.total}
            color="text-gray-900"
          />
          {Object.entries(report.safetyZones.byType).map(([type, count]) => (
            <ReportStat
              key={type}
              label={type.replace("_", " ")}
              value={count}
              color="text-gray-700"
              capitalize
            />
          ))}
        </div>
      </Card>

      {/* Export buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
        >
          🖨️ Print Report
        </button>
      </div>
    </div>
  );
}

function ReportStat({
  label,
  value,
  color,
  capitalize = false,
}: {
  label: string;
  value: string | number;
  color: string;
  capitalize?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div
        className={`text-xs text-gray-500 mt-1 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {label}
      </div>
    </div>
  );
}
