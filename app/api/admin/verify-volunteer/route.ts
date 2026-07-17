import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, verified } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isVerified: verified === true },
      { new: true }
    )
      .select("-passwordHash")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: verified
        ? "Volunteer verified successfully"
        : "Volunteer verification revoked",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Volunteer verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
