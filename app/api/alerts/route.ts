import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EmergencyAlert } from "@/lib/models/alert";
import { User } from "@/lib/models/user";
import { getAuthUser } from "@/lib/auth";
import { encryptData, decryptData } from "@/lib/crypto-data";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // Max 5 alerts per minute
const RATE_LIMIT_WINDOW = 60 * 1000;

import { z } from "zod";

const AlertSchema = z.object({
  lat: z.number({ error: "Latitude is required" }),
  lng: z.number({ error: "Longitude is required" }),
  address: z.string().optional(),
  details: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting Logic
    const now = Date.now();
    let userLimit = rateLimitMap.get(user.id) || { count: 0, lastReset: now };
    if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
      userLimit = { count: 0, lastReset: now };
    }
    if (userLimit.count >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "Too many SOS requests. Please wait a moment." },
        { status: 429 }
      );
    }
    userLimit.count++;
    rateLimitMap.set(user.id, userLimit);

    if (user.role !== "women") {
      return NextResponse.json(
        { error: "Only women can trigger emergency alerts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = AlertSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400 }
      );
    }
    
    const { lat, lng, address, details } = parsed.data;

    await connectToDatabase();

    const alert = await EmergencyAlert.create({
      userId: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      status: "active",
      location: {
        lat: Number(lat),
        lng: Number(lng),
        address: address || "",
        timestamp: Date.now(),
      },
      details: details || "",
      safetyProfile: user.safetyProfile ? {
        bloodGroup: user.safetyProfile.bloodGroup,
        medicalNotes: encryptData(user.safetyProfile.medicalNotes),
        allergies: encryptData(user.safetyProfile.allergies),
        emergencyNote: encryptData(user.safetyProfile.emergencyNote),
      } : undefined,
      contacts: user.contacts || [],
      responders: [],
    });

    // Update user's current location in DB
    await User.updateOne(
      { username: user.username },
      {
        $set: {
          currentLocation: {
            lat: Number(lat),
            lng: Number(lng),
            address: address || "",
            timestamp: Date.now(),
          },
        },
      }
    );

    return NextResponse.json(
      {
        message: "Emergency alert sent! Help is on the way.",
        alert,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Alert creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get alerts (role-based)
export async function GET(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const query: Record<string, unknown> = {};

    // Role-based filtering
    if (user.role === "women") {
      // Women see only their own alerts
      query.userId = user.id;
    } else if (user.role === "parent") {
      // Parents see alerts of linked daughter
      if (user.linkedDaughter) {
        const daughter = await User.findOne({ username: user.linkedDaughter });
        if (daughter) {
          query.userId = daughter.id;
        } else {
          return NextResponse.json({ alerts: [] });
        }
      } else {
        return NextResponse.json({ alerts: [] });
      }
    } else if (user.role === "volunteer") {
      // Volunteers see active nearby alerts (or all they've responded to)
      if (status === "mine") {
        query["responders.volunteerId"] = user.id;
      } else {
        query.status = "active";
      }
    }
    // Admin sees all

    // Override with explicit filters
    if (status && status !== "mine") {
      query.status = status;
    }
    if (userId && user.role === "admin") {
      query.userId = userId;
    }

    const alerts = await EmergencyAlert.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Convert _id to id for frontend compatibility and decrypt safety profile
    const serialized = alerts.map((alert: any) => ({
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
    }));

    return NextResponse.json({ alerts: serialized });
  } catch (error) {
    console.error("Alert fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
