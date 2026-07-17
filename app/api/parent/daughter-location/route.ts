import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "parent" || !user.linkedDaughter) {
      return NextResponse.json({ error: "Unauthorized or no linked daughter" }, { status: 401 });
    }

    await connectToDatabase();
    const daughter = await User.findOne({ username: user.linkedDaughter }).lean();

    if (!daughter || !daughter.currentLocation) {
      return NextResponse.json({ location: null });
    }

    return NextResponse.json({ location: daughter.currentLocation });
  } catch (error) {
    console.error("Fetch daughter location error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
