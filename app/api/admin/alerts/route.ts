import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EmergencyAlert } from "@/lib/models/alert";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const alerts = await EmergencyAlert.find()
      .sort({ createdAt: -1 })
      .lean();

    const serialized = alerts.map((alert: Record<string, unknown>) => ({
      ...alert,
      id: (alert._id as { toString(): string }).toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ alerts: serialized });
  } catch (error) {
    console.error("Admin alerts fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
