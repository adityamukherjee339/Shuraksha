"use client";

import React, { useState, useCallback } from "react";
import { Modal } from "./modal";
import { Button } from "./button";

interface SOSButtonProps {
  onTrigger: (details: string) => Promise<void>;
  disabled?: boolean;
  hasLocation?: boolean;
}

export function SOSButton({
  onTrigger,
  disabled = false,
  hasLocation = false,
}: SOSButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [details, setDetails] = useState("");

  const handleSend = useCallback(async () => {
    setSending(true);
    try {
      await onTrigger(details);
      setShowConfirm(false);
      setDetails("");
    } catch (error) {
      console.error("SOS error, triggering SMS fallback:", error);
      
      // Fallback to SMS if network fails
      const message = encodeURIComponent(
        `EMERGENCY: I need help! ${details ? `Details: ${details}` : ""}`
      );
      
      // Check for iOS vs Android for correct SMS body separator
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const separator = isIOS ? "&" : "?";
      
      // 1091 is Women Helpline in India, can be changed based on region
      window.location.href = `sms:1091${separator}body=${message}`;
      
      setShowConfirm(false);
      setDetails("");
    } finally {
      setSending(false);
    }
  }, [onTrigger, details]);

  return (
    <>
      <div className="relative inline-flex">
        {/* Pulsing ring behind button */}
        <div className="absolute inset-0 rounded-full sos-ring bg-red-500/20" />

        <button
          onClick={() => setShowConfirm(true)}
          disabled={disabled}
          className="relative w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-red-700 sos-pulse
                     flex flex-col items-center justify-center text-white font-bold text-xl
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-red-600 hover:to-red-800 active:scale-95 transition-transform
                     focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          <svg
            className="w-12 h-12 mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>SOS</span>
          <span className="text-xs font-normal mt-0.5">Emergency</span>
        </button>
      </div>

      <Modal
        isOpen={showConfirm}
        onClose={() => {
          if (!sending) setShowConfirm(false);
        }}
        title="🚨 Trigger Emergency Alert"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800 font-medium">
              Your location {hasLocation ? "will be" : "is NOT"} shared with emergency responders.
              {!hasLocation && " Enable location for faster help."}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe your emergency situation..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                if (!sending) setShowConfirm(false);
              }}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleSend}
              loading={sending}
              disabled={!hasLocation}
            >
              {sending ? "SENDING..." : "SEND SOS"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
