"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface ZoneData {
  _id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  resources: string[];
}

const typeOptions = [
  { value: "police", label: "Police Station", icon: "🚔" },
  { value: "hospital", label: "Hospital", icon: "🏥" },
  { value: "safe_house", label: "Safe House", icon: "🏠" },
  { value: "community_center", label: "Community Center", icon: "🏛️" },
];

export default function ManageZonesPage() {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "police",
    lat: "",
    lng: "",
    address: "",
    phone: "",
    resources: "",
  });

  const fetchZones = async () => {
    try {
      const res = await fetch("/api/safety-zones");
      if (res.ok) {
        const data = await res.json();
        setZones(data.zones || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchZones();
    })();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.lat || !form.lng || !form.address || !form.phone) {
      setFormError("Please fill all required fields");
      return;
    }
    setFormError("");

    setSaving(true);
    try {
      const res = await fetch("/api/safety-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: Number(form.lat),
          lng: Number(form.lng),
          resources: form.resources
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({
          name: "",
          type: "police",
          lat: "",
          lng: "",
          address: "",
          phone: "",
          resources: "",
        });
        fetchZones();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const typeIcons: Record<string, string> = {
    police: "🚔",
    hospital: "🏥",
    safe_house: "🏠",
    community_center: "🏛️",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🗺️ Safety Zones
          </h1>
          <p className="text-gray-500 mt-1">
            Manage safe zones ({zones.length})
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          + Add Zone
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : zones.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <p className="text-gray-500">No safety zones configured</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {zones.map((zone) => (
            <Card key={zone._id}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {typeIcons[zone.type] || "📍"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">
                    {zone.type.replace("_", " ")}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {zone.address}
                  </p>
                  <p className="text-sm text-gray-500">{zone.phone}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    📍 {zone.lat}, {zone.lng}
                  </p>
                  {zone.resources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {zone.resources.map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Safety Zone"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {formError}
            </div>
          )}
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Zone name"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude *"
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))}
              placeholder="28.6304"
            />
            <Input
              label="Longitude *"
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) => setForm((p) => ({ ...p, lng: e.target.value }))}
              placeholder="77.2177"
            />
          </div>

          <Input
            label="Address *"
            value={form.address}
            onChange={(e) =>
              setForm((p) => ({ ...p, address: e.target.value }))
            }
            placeholder="Full address"
          />

          <Input
            label="Phone *"
            value={form.phone}
            onChange={(e) =>
              setForm((p) => ({ ...p, phone: e.target.value }))
            }
            placeholder="Contact number"
          />

          <Input
            label="Resources (comma separated)"
            value={form.resources}
            onChange={(e) =>
              setForm((p) => ({ ...p, resources: e.target.value }))
            }
            placeholder="24/7 Patrol, First Aid, Shelter"
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAdd}
              loading={saving}
            >
              Add Zone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
