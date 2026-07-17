import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";
import { encryptData } from "@/lib/crypto-data";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove passwordHash from response
    const userResponse = Object.fromEntries(
      Object.entries(user as unknown as Record<string, unknown>).filter(([k]) => k !== "passwordHash")
    );
    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, safetyProfile, contacts, currentLocation } = body;

    await connectToDatabase();

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();

    if (user.role === "women") {
      if (safetyProfile !== undefined) {
        updateData.safetyProfile = {
          bloodGroup: safetyProfile.bloodGroup || "",
          medicalNotes: encryptData(safetyProfile.medicalNotes || ""),
          allergies: encryptData(safetyProfile.allergies || ""),
          emergencyNote: encryptData(safetyProfile.emergencyNote || ""),
        };
      }
      if (contacts !== undefined && Array.isArray(contacts)) {
        updateData.contacts = contacts.map((c: Record<string, string>) => ({
          id:
            c.id ||
            `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: c.name || "",
          phone: c.phone || "",
          relationship: c.relationship || "",
        }));
      }
    }

    if (currentLocation !== undefined) {
      updateData.currentLocation = {
        lat: Number(currentLocation.lat),
        lng: Number(currentLocation.lng),
        address: currentLocation.address || "",
        timestamp: Date.now(),
      };
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: user.username },
      { $set: updateData },
      { new: true }
    )
      .select("-passwordHash")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const typed = updatedUser as Record<string, unknown>;
    return NextResponse.json({
      message: "Profile updated successfully",
      user: { ...typed, id: (typed._id as { toString(): string }).toString() },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
