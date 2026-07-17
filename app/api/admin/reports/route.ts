import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EmergencyAlert } from "@/lib/models/alert";
import { User } from "@/lib/models/user";
import { SafetyZone } from "@/lib/models/safety-zone";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const totalAlerts = await EmergencyAlert.countDocuments();
    const activeAlerts = await EmergencyAlert.countDocuments({ status: "active" });
    const resolvedAlerts = await EmergencyAlert.countDocuments({ status: "resolved" });

    const totalUsers = await User.countDocuments();
    const womenCount = await User.countDocuments({ role: "women" });
    const parentCount = await User.countDocuments({ role: "parent" });
    const volunteerCount = await User.countDocuments({ role: "volunteer" });
    const verifiedVolunteers = await User.countDocuments({
      role: "volunteer",
      isVerified: true,
    });
    const adminCount = await User.countDocuments({ role: "admin" });

    const zoneCount = await SafetyZone.countDocuments();
    const zonesByType = await SafetyZone.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    // Average response time (time from alert creation to first responder acceptance)
    const alertsWithResponses = await EmergencyAlert.find({
      "responders.0": { $exists: true },
    }).lean();

    let avgResponseTime = 0;
    if (alertsWithResponses.length > 0) {
      const totalTime = alertsWithResponses.reduce((sum, alert: Record<string, unknown>) => {
        const createdTime = new Date(alert.createdAt as string).getTime();
        const responders = alert.responders as Array<{ updatedAt: string }>;
        const firstResponder = responders[0];
        const responseTime = new Date(firstResponder.updatedAt).getTime();
        return sum + (responseTime - createdTime);
      }, 0);
      avgResponseTime = Math.round(totalTime / alertsWithResponses.length / 1000);
    }

    return NextResponse.json({
      alerts: {
        total: totalAlerts,
        active: activeAlerts,
        resolved: resolvedAlerts,
        avgResponseTimeSeconds: avgResponseTime,
      },
      users: {
        total: totalUsers,
        women: womenCount,
        parents: parentCount,
        volunteers: volunteerCount,
        verifiedVolunteers,
        admins: adminCount,
      },
      safetyZones: {
        total: zoneCount,
        byType: zonesByType.reduce(
          (acc: Record<string, number>, z: { _id: string; count: number }) => {
            acc[z._id] = z.count;
            return acc;
          },
          {}
        ),
      },
    });
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
