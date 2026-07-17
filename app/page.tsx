"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";

const roleRedirects: Record<string, string> = {
  women: "/women",
  parent: "/parent",
  volunteer: "/volunteer",
  admin: "/admin",
};

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(roleRedirects[user.role] || "/login");
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              SHURAKSHA
            </span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-4">
              🛡️ Women Safety Platform
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
              Your Safety is{" "}
              <span className="text-primary">Our Priority</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              SHURAKSHA is a comprehensive emergency response platform. One-click
              SOS, real-time location sharing, and instant volunteer support
              when you need it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/register"
                className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-red-200 text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-center"
              >
                I&apos;m a Volunteer
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 rounded-full bg-gradient-to-br from-red-100 via-red-50 to-orange-100 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 sos-pulse flex flex-col items-center justify-center text-white">
                  <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-3xl font-black">SOS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
          Everything You Need for Safety
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <span className="text-2xl">{f.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
          Who is SHURAKSHA For?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center"
            >
              <div className="text-4xl mb-3">{r.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{r.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{r.desc}</p>
              <Link
                href={r.href}
                className="text-sm font-semibold text-primary hover:text-primary-dark"
              >
                {r.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
          © 2026 SHURAKSHA. Built with ❤️ for women safety.
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: "🚨", title: "One-Click SOS", desc: "Trigger emergency alerts instantly with a single tap. Your location and profile are shared with responders immediately." },
  { icon: "📍", title: "Real-Time Location", desc: "Share your live location during emergencies. Responders can track your movement and reach you faster." },
  { icon: "🛡️", title: "Safety Profile", desc: "Maintain your medical information, emergency contacts, and critical details accessible to responders during emergencies." },
  { icon: "👥", title: "Trusted Contacts", desc: "Add emergency contacts who are notified automatically when you trigger an SOS alert." },
  { icon: "🗺️", title: "Safe Zones", desc: "View nearby police stations, hospitals, and safe houses on an interactive map." },
  { icon: "🤝", title: "Volunteer Network", desc: "Trained volunteers in your area receive alerts and can respond to provide immediate assistance." },
];

const roles = [
  { icon: "👩", title: "For Women", desc: "Complete safety toolkit with SOS, location sharing, emergency contacts, and safe zone mapping.", href: "/register", cta: "Create Account" },
  { icon: "👨‍👩‍👧", title: "For Parents", desc: "Stay connected with your daughter's safety. Monitor alerts and get notified during emergencies.", href: "/register?role=parent", cta: "Register as Parent" },
  { icon: "🦸", title: "For Volunteers", desc: "Join the response network. Get alerted about nearby emergencies and provide critical help.", href: "/register?role=volunteer", cta: "Join as Volunteer" },
];

export default function HomePage() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
