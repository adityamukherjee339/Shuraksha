"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { useAnomalyDetection } from "@/hooks/use-anomaly-detection";
import { SafetyChatWidget } from "@/components/ui/safety-chat-widget";

function DashboardFeatures({ userRole }: { userRole?: string }) {
  const { showPrompt, cancelPrompt } = useAnomalyDetection();
  
  if (userRole !== "women") return null;

  return (
    <>
      {showPrompt && (
         <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
               <span className="text-2xl">⚠️</span>
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Are you okay?</h3>
             <p className="text-gray-500 mb-6 text-sm">We detected unusual movement patterns. SOS will trigger automatically in 60s if you don't respond.</p>
             <button onClick={cancelPrompt} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
               I'm Safe
             </button>
           </div>
         </div>
      )}
      <SafetyChatWidget userRole={userRole} />
    </>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
      <DashboardFeatures userRole={user?.role} />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  );
}
