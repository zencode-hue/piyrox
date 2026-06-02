import { cookies } from "next/headers";
import { getServerSession } from "@/lib/auth";

/**
 * Verifies the current request is from an authenticated ADMIN user.
 * Returns the admin user or null if not authorized.
 */
export async function verifyAdminSession() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return null;
    }

    if (session.user.role !== "ADMIN") {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    };
  } catch {
    return null;
  }
}

/**
 * Verifies admin session from cookies (for middleware / edge contexts).
 * Checks for the presence of the session cookie and validates.
 */
export async function verifyAdminCookie(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionToken =
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      return false;
    }

    // In edge/middleware context we rely on the JWT token
    // Full session verification happens in verifyAdminSession()
    const session = await getServerSession();
    return session?.user?.role === "ADMIN";
  } catch {
    return false;
  }
}

/**
 * Gets admin user or throws an error (for use in API routes).
 */
export async function requireAdmin() {
  const admin = await verifyAdminSession();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
  return admin;
}
