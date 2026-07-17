import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SafetyZone } from "@/lib/models/safety-zone";
import { getAuthUser } from "@/lib/auth";

// Get all safety zones (public for authenticated users)
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const zones = await SafetyZone.find().sort({ name: 1 }).lean();

    const serialized = zones.map((zone: Record<string, unknown>) => ({
      ...zone,
      id: (zone._id as { toString(): string }).toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ zones: serialized });
  } catch (error) {
    console.error("Safety zones fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a safety zone (admin only)
export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, lat, lng, address, phone, resources } = body;

    if (!name || !type || !lat || !lng || !address || !phone) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const zone = await SafetyZone.create({
      name,
      type,
      lat: Number(lat),
      lng: Number(lng),
      address,
      phone,
      resources: resources || [],
    });

    return NextResponse.json(
      {
        message: "Safety zone created",
        zone: { ...zone.toObject(), id: zone._id.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Safety zone creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
