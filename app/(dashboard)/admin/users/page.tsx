"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface UserData {
  _id: string;
  username: string;
  role: string;
  name: string;
  phone: string;
  isVerified?: boolean;
  createdAt: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchUsers();
    })();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const roleColors: Record<string, string> = {
    women: "bg-pink-100 text-pink-700",
    parent: "bg-blue-100 text-blue-700",
    volunteer: "bg-orange-100 text-orange-700",
    admin: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 Manage Users</h1>
          <p className="text-gray-500 mt-1">
            All registered users ({users.length})
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading users...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-500">Name</th>
                  <th className="text-left p-3 font-medium text-gray-500">Username</th>
                  <th className="text-left p-3 font-medium text-gray-500">Phone</th>
                  <th className="text-left p-3 font-medium text-gray-500">Role</th>
                  <th className="text-left p-3 font-medium text-gray-500">Status</th>
                  <th className="text-left p-3 font-medium text-gray-500">Joined</th>
                  <th className="text-right p-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium text-gray-900">{u.name}</td>
                    <td className="p-3 text-gray-600">{u.username}</td>
                    <td className="p-3 text-gray-600">{u.phone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          roleColors[u.role] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.role === "volunteer" ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.isVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {u.isVerified ? "Verified" : "Pending"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(u._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
