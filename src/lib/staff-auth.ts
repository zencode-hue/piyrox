import { cookies } from "next/headers";
import { db } from "@/lib/db";

export interface StaffSession {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

const STAFF_COOKIE_NAME = "staff-session";

/**
 * Verifies the current request has a valid staff session.
 * Returns the staff member data or null.
 */
export async function verifyStaffSession(): Promise<StaffSession | null> {
  try {
    const cookieStore = cookies();
    const staffCookie = cookieStore.get(STAFF_COOKIE_NAME)?.value;

    if (!staffCookie) {
      return null;
    }

    // The cookie stores a signed staff member ID
    let staffId: string;
    try {
      const decoded = Buffer.from(staffCookie, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      staffId = parsed.id;

      if (!staffId) return null;

      // Check token expiry
      if (parsed.exp && Date.now() > parsed.exp) {
        return null;
      }
    } catch {
      return null;
    }

    const staffMember = await db.staffMember.findUnique({
      where: { id: staffId },
    });

    if (!staffMember || staffMember.status !== "ACTIVE") {
      return null;
    }

    return {
      id: staffMember.id,
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      permissions: staffMember.permissions,
    };
  } catch {
    return null;
  }
}

/**
 * Creates a staff session cookie value.
 */
export function createStaffSessionToken(staffId: string): string {
  const payload = {
    id: staffId,
    iat: Date.now(),
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Gets staff member or throws (for API routes).
 */
export async function requireStaff(): Promise<StaffSession> {
  const staff = await verifyStaffSession();
  if (!staff) {
    throw new Error("Unauthorized: Staff access required");
  }
  return staff;
}

/**
 * Check if staff has a specific permission.
 */
export async function requireStaffPermission(
  permission: string
): Promise<StaffSession> {
  const staff = await requireStaff();
  if (!staff.permissions.includes(permission) && staff.role !== "manager") {
    throw new Error(`Unauthorized: Missing permission '${permission}'`);
  }
  return staff;
}
