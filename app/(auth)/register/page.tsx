"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const roleRedirects: Record<string, string> = {
  women: "/women",
  parent: "/parent",
  volunteer: "/volunteer",
  admin: "/admin",
};

function getInitialRole(searchParams: ReturnType<typeof useSearchParams>) {
  const role = searchParams.get("role");
  if (role && ["women", "parent", "volunteer"].includes(role)) return role;
  return "women";
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: getInitialRole(searchParams),
    name: "",
    phone: "",
    linkedDaughter: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, register } = useAuth();

  useEffect(() => {
    if (user) {
      const redirect = roleRedirects[user.role] || "/";
      router.push(redirect);
    }
  }, [user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const regData = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        name: formData.name,
        phone: formData.phone,
        linkedDaughter:
          formData.role === "parent" ? formData.linkedDaughter : undefined,
      };

      await register(regData);
      setSuccess("Registration successful! Redirecting...");
      // Auth provider will handle redirect
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const roleDescriptions: Record<string, string> = {
    women: "Access SOS alerts, safety profile, emergency contacts & safe zones",
    parent: "Monitor your daughter's safety and receive emergency notifications",
    volunteer:
      "Join as a verified responder to help women in emergency situations",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">SHURAKSHA</span>
        </Link>

        <Card padding="lg" className="shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Join SHURAKSHA — choose your role below
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["women", "parent", "volunteer"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    name="role"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role }))
                    }
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      formData.role === role
                        ? "border-primary bg-red-50 text-primary font-semibold"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-xl mb-1">
                      {role === "women"
                        ? "👩"
                        : role === "parent"
                        ? "👨‍👩‍👧"
                        : "🦸"}
                    </div>
                    <div className="text-xs capitalize">{role}</div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {roleDescriptions[formData.role]}
              </p>
            </div>

            <Input
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
            />

            {formData.role === "parent" && (
              <Input
                label="Linked Daughter's Username"
                name="linkedDaughter"
                type="text"
                value={formData.linkedDaughter}
                onChange={handleChange}
                placeholder="Enter your daughter's SHURAKSHA username"
              />
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-dark"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <React.Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <RegisterForm />
      </React.Suspense>
    </AuthProvider>
  );
}
