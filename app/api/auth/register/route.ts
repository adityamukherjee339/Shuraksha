import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";
import { hashPassword } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, role, name, phone, linkedDaughter } = body;

    if (!username || !password || !role || !name || !phone) {
      return NextResponse.json(
        { error: "All fields (username, password, role, name, phone) are required." },
        { status: 400 }
      );
    }

    if (!["women", "parent", "volunteer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const userExists = await User.findOne({
      username: username.toLowerCase(),
    });
    if (userExists) {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const userData: Record<string, unknown> = {
      username: username.trim().toLowerCase(),
      passwordHash: hashedPassword,
      role,
      name: name.trim(),
      phone: phone.trim(),
    };

    if (role === "volunteer") {
      userData.isVerified = false;
      userData.currentLocation = {
        lat: 28.6139,
        lng: 77.209,
        timestamp: Date.now(),
      };
    } else if (role === "women") {
      userData.safetyProfile = {
        bloodGroup: "",
        medicalNotes: "",
        allergies: "",
        emergencyNote: "",
      };
      userData.contacts = [];
      userData.currentLocation = {
        lat: 28.6139,
        lng: 77.209,
        timestamp: Date.now(),
      };
    } else if (role === "parent" && linkedDaughter) {
      userData.linkedDaughter = linkedDaughter.trim();
    }

    const newUser = await User.create(userData);

    const userObj = newUser.toObject();
    const userResponse = { ...userObj };
    delete userResponse.passwordHash;

    return NextResponse.json(
      { message: "Registration successful", user: { ...userResponse, id: userObj._id.toString() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
