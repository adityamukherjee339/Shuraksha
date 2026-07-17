import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";
import { verifyPassword, encryptSession } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({
      username: username.toLowerCase(),
    }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const typedUser = user as Record<string, unknown>;

    const isValid = await verifyPassword(password, typedUser.passwordHash as string);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    if (typedUser.role === "volunteer" && !typedUser.isVerified) {
      return NextResponse.json(
        { error: "Your volunteer account is pending admin verification. Please wait for approval." },
        { status: 403 }
      );
    }

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const token = encryptSession({
      userId: (typedUser._id as { toString(): string }).toString(),
      username: typedUser.username as string,
      role: typedUser.role as "women" | "parent" | "volunteer" | "admin",
      expiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set("shuraksha_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    const userResponse = { ...typedUser };
    delete userResponse.passwordHash;

    return NextResponse.json({
      message: "Login successful",
      user: { ...userResponse, id: (typedUser._id as { toString(): string }).toString() },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    );
  }
}
