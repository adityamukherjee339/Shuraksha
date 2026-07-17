"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VolunteerData {
  _id: string;
  username: string;
  name: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
}

export default function ManageVolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchVolunteers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setVolunteers(
          (data.users || []).filter((u: Record<string, unknown>) => u.role === "volunteer")
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchVolunteers();
    })();
  }, []);

  const handleVerify = async (userId: string, verified: boolean) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/verify-volunteer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, verified }),
      });
      if (res.ok) {
        setVolunteers((prev) =>
          prev.map((v) => (v._id === userId ? { ...v, isVerified: verified } : v))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const pending = volunteers.filter((v) => !v.isVerified);
  const verified = volunteers.filter((v) => v.isVerified);

  const handleDelete = async (userId: string) => {
    if (!confirm("Reject this volunteer application?")) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVolunteers((prev) => prev.filter((v) => v._id !== userId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🦸 Volunteer Management</h1>
        <p className="text-gray-500 mt-1">
          {pending.length} pending verification · {verified.length} verified
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Pending Volunteers */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                ⏳ Pending Verification
              </h2>
              <div className="space-y-3">
                {pending.map((v) => (
                  <Card key={v._id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{v.name}</p>
                        <p className="text-sm text-gray-500">
                          @{v.username} · {v.phone}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(v.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleVerify(v._id, true)}
                          loading={actionLoading === v._id}
                        >
                          ✅ Verify
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(v._id)}
                          className="text-red-500"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Verified Volunteers */}
          {verified.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                ✅ Verified Volunteers
              </h2>
              <div className="space-y-2">
                {verified.map((v) => (
                  <Card key={v._id} padding="sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">
                          {v.name}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">
                          @{v.username} · {v.phone}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerify(v._id, false)}
                        loading={actionLoading === v._id}
                      >
                        Revoke
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {volunteers.length === 0 && (
            <Card padding="lg" className="text-center py-12">
              <div className="text-4xl mb-3">🦸</div>
              <p className="text-gray-500 font-medium">
                No volunteers registered yet
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
