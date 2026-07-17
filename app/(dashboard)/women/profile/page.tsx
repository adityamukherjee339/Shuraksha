"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export default function SafetyProfilePage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    bloodGroup: user?.safetyProfile?.bloodGroup || "",
    allergies: user?.safetyProfile?.allergies || "",
    medicalNotes: user?.safetyProfile?.medicalNotes || "",
    emergencyNote: user?.safetyProfile?.emergencyNote || "",
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ safetyProfile: form }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profile saved successfully!");
        refreshUser();
      } else {
        setMessage(data.error || "Failed to save");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🛡️ Safety Profile</h1>
        <p className="text-gray-500 mt-1">
          Your medical and emergency information shared with responders during
          SOS alerts
        </p>
      </div>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <select
              value={form.bloodGroup}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bloodGroup: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Allergies"
            value={form.allergies}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, allergies: e.target.value }))
            }
            placeholder="e.g., Penicillin, Peanuts"
          />

          <Textarea
            label="Medical Notes"
            value={form.medicalNotes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, medicalNotes: e.target.value }))
            }
            placeholder="Any medical conditions responders should know about"
          />

          <Textarea
            label="Emergency Note"
            value={form.emergencyNote}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, emergencyNote: e.target.value }))
            }
            placeholder="Special instructions during emergencies"
          />
        </div>
      </Card>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes("success")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <Button onClick={handleSave} loading={saving} className="w-full" size="lg">
        Save Safety Profile
      </Button>
    </div>
  );
}
