import { cookies } from "next/headers";
import { connectToDatabase } from "./mongodb";
import { User } from "./models/user";
import { decryptSession } from "./crypto";
import { decryptData } from "./crypto-data";
import type { AuthUser } from "@/types";

export type { AuthUser };

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("shuraksha_session")?.value;
    if (!sessionToken) return null;

    const payload = decryptSession(sessionToken);
    if (!payload) return null;

    await connectToDatabase();

    const user = await User.findOne({ username: payload.username }).lean();
    if (!user) return null;

    const u = user as Record<string, unknown>;
    return {
      id: (u._id as { toString(): string }).toString(),
      username: u.username as string,
      passwordHash: u.passwordHash as string,
      role: u.role as AuthUser["role"],
      name: u.name as string,
      phone: u.phone as string,
      isVerified: u.isVerified as boolean | undefined,
      linkedDaughter: u.linkedDaughter as string | undefined,
      safetyProfile: u.safetyProfile ? {
        bloodGroup: (u.safetyProfile as any).bloodGroup || "",
        medicalNotes: decryptData((u.safetyProfile as any).medicalNotes || ""),
        allergies: decryptData((u.safetyProfile as any).allergies || ""),
        emergencyNote: decryptData((u.safetyProfile as any).emergencyNote || ""),
      } : undefined,
      contacts: u.contacts as AuthUser["contacts"],
      currentLocation: u.currentLocation as AuthUser["currentLocation"],
      createdAt: (u.createdAt as Date)?.toISOString?.() || (u.createdAt as string),
    };
  } catch (error) {
    console.error("Error in getAuthUser:", error);
    return null;
  }
}
