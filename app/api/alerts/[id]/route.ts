import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EmergencyAlert } from "@/lib/models/alert";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const alert = await EmergencyAlert.findById(id).lean();
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const typed = alert as Record<string, unknown>;
    return NextResponse.json({
      alert: { ...typed, id: (typed._id as { toString(): string }).toString() },
    });
  } catch (error) {
    console.error("Alert fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    await connectToDatabase();

    const updateData: Record<string, unknown> = {};
    if (status === "resolved") {
      updateData.status = "resolved";
      updateData.resolvedAt = new Date();
    }

    const alert = await EmergencyAlert.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const typed = alert as Record<string, unknown>;
    return NextResponse.json({
      message: "Alert updated",
      alert: { ...typed, id: (typed._id as { toString(): string }).toString() },
    });
  } catch (error) {
    console.error("Alert update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
