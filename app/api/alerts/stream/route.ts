import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EmergencyAlert } from "@/lib/models/alert";
import { getAuthUser } from "@/lib/auth";
import { decryptData } from "@/lib/crypto-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial heartbeat
      sendEvent({ type: "connected" });
      
      const pingInterval = setInterval(() => {
        sendEvent({ type: "ping" });
      }, 30000);

      try {
        // Watch for changes in EmergencyAlert collection
        const changeStream = EmergencyAlert.watch([], { fullDocument: "updateLookup" });

        changeStream.on("change", (change) => {
          if (change.operationType === "insert" || change.operationType === "update") {
            const alert = change.fullDocument;
            if (!alert) return;

            // Role-based filtering for the stream
            let shouldSend = false;
            if (user.role === "admin") {
              shouldSend = true;
            } else if (user.role === "volunteer" && alert.status === "active") {
              shouldSend = true; // Volunteers get notified of active alerts
            } else if (user.role === "parent" && user.linkedDaughter) {
               // Assuming linkedDaughter is the username
               if (alert.username === user.linkedDaughter) {
                 shouldSend = true;
               }
            } else if (user.role === "women" && alert.userId === user.id) {
               shouldSend = true;
            }

            if (shouldSend) {
              const serialized = {
                ...alert,
                id: alert._id.toString(),
                _id: undefined,
                __v: undefined,
                safetyProfile: alert.safetyProfile ? {
                  ...alert.safetyProfile,
                  medicalNotes: decryptData(alert.safetyProfile.medicalNotes || ""),
                  allergies: decryptData(alert.safetyProfile.allergies || ""),
                  emergencyNote: decryptData(alert.safetyProfile.emergencyNote || ""),
                } : undefined,
              };
              sendEvent({ type: "alert_update", alert: serialized });
            }
          }
        });

        // Clean up on disconnect
        request.signal.addEventListener("abort", () => {
          clearInterval(pingInterval);
          changeStream.close();
          controller.close();
        });

      } catch (err) {
        console.error("Change stream error:", err);
        clearInterval(pingInterval);
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
