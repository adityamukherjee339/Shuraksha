import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";
import { getAuthUser } from "@/lib/auth";

// Get all users (admin only)
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("-passwordHash")
      .lean();

    const serialized = users.map((u: Record<string, unknown>) => ({
      ...u,
      id: (u._id as { toString(): string }).toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ users: serialized });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a user (admin only)
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
