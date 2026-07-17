"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function EmergencyContactsPage() {
  const { user, refreshUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    relationship: "",
  });
  const [contacts, setContacts] = useState(user?.contacts || []);

  const openAdd = () => {
    setForm({ name: "", phone: "", relationship: "" });
    setEditingIndex(null);
    setShowModal(true);
  };

  const openEdit = (index: number) => {
    const c = contacts[index];
    setForm({ name: c.name, phone: c.phone, relationship: c.relationship });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) return;

    let updated: typeof contacts;
    if (editingIndex !== null) {
      updated = contacts.map((c, i) =>
        i === editingIndex
          ? { ...c, ...form, id: c.id }
          : c
      );
    } else {
      updated = [
        ...contacts,
        {
          id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...form,
        },
      ];
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: updated }),
      });
      if (res.ok) {
        setContacts(updated);
        setShowModal(false);
        refreshUser();
      }
    } catch {
      setError("Failed to save contact");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    const updated = contacts.filter((_, i) => i !== index);
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: updated }),
      });
      if (res.ok) {
        setContacts(updated);
        refreshUser();
      }
    } catch {
      setError("Failed to delete contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            👥 Emergency Contacts
          </h1>
          <p className="text-gray-500 mt-1">
            These contacts are notified when you trigger an SOS alert
          </p>
        </div>
        <Button onClick={openAdd} variant="primary">
          + Add Contact
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
          <button onClick={() => setError("")} className="ml-2 font-medium">&times;</button>
        </div>
      )}

      {contacts.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-gray-500 font-medium mb-1">
            No emergency contacts yet
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Add trusted contacts who will be notified during emergencies
          </p>
          <Button onClick={openAdd}>Add Your First Contact</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {contacts.map((c, i) => (
            <Card key={c.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">
                      {c.relationship} · {c.phone}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(i)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingIndex !== null ? "Edit Contact" : "Add Emergency Contact"}
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Enter contact name"
          />
          <Input
            label="Phone Number"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+91 98765 43210"
          />
          <Input
            label="Relationship"
            value={form.relationship}
            onChange={(e) =>
              setForm((p) => ({ ...p, relationship: e.target.value }))
            }
            placeholder="e.g., Father, Mother, Spouse"
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
              onClick={handleSave}
              loading={saving}
              disabled={!form.name || !form.phone}
            >
              {editingIndex !== null ? "Update" : "Add Contact"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
