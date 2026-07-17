import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EmergencyAlert } from "@/lib/models/alert";
import { getAuthUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "volunteer" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, lat, lng } = body; // action: accept | decline | en_route | on_scene | resolved

    await connectToDatabase();

    const alert = await EmergencyAlert.findById(id);
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Find if volunteer already has a response
    const existingIndex = alert.responders.findIndex(
      (r: { volunteerId: string }) => r.volunteerId === user.id
    );

    if (action === "accept" || action === "decline") {
      const responder = {
        volunteerId: user.id,
        volunteerName: user.name,
        volunteerPhone: user.phone,
        status: action === "accept" ? ("accepted" as const) : ("declined" as const),
        updatedAt: now,
        lat: lat || undefined,
        lng: lng || undefined,
      };

      if (existingIndex >= 0) {
        alert.responders[existingIndex] = responder;
      } else {
        alert.responders.push(responder);
      }
    } else if (
      ["en_route", "on_scene", "resolved"].includes(action) &&
      existingIndex >= 0
    ) {
      alert.responders[existingIndex].status = action as
        | "en_route"
        | "on_scene"
        | "resolved";
      alert.responders[existingIndex].updatedAt = now;
      if (lat !== undefined) alert.responders[existingIndex].lat = lat;
      if (lng !== undefined) alert.responders[existingIndex].lng = lng;

      // If any responder resolves, mark alert as resolved
      if (action === "resolved") {
        alert.status = "resolved";
        alert.resolvedAt = new Date();
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await alert.save();

    return NextResponse.json({
      message: `Response recorded: ${action}`,
      alert: {
        ...alert.toObject(),
        id: alert._id.toString(),
        _id: undefined,
      },
    });
  } catch (error) {
    console.error("Alert respond error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
