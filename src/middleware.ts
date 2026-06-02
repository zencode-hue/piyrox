import { NextRequest, NextResponse } from "next/server";

// ─── In-line rate limiter for Edge Runtime ──────────────────
// (Cannot import from src/lib/rate-limit.ts because middleware runs in Edge)

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const rateLimitStore = new Map<string, RateLimitEntry>();

function edgeRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let entry = rateLimitStore.get(ip);

  // Periodic cleanup (every 5 min)
  if (rateLimitStore.size > 10_000) {
    const cutoff = now - WINDOW_MS * 2;
    for (const [key, val] of rateLimitStore.entries()) {
      if (val.lastRefill < cutoff) rateLimitStore.delete(key);
    }
  }

  if (!entry) {
    entry = { tokens: MAX_REQUESTS - 1, lastRefill: now };
    rateLimitStore.set(ip, entry);
    return { allowed: true, remaining: entry.tokens, resetAt: now + WINDOW_MS };
  }

  const elapsed = now - entry.lastRefill;
  const refill = Math.floor((elapsed / WINDOW_MS) * MAX_REQUESTS);
  if (refill > 0) {
    entry.tokens = Math.min(MAX_REQUESTS, entry.tokens + refill);
    entry.lastRefill = now;
  }

  if (entry.tokens <= 0) {
    return { allowed: false, remaining: 0, resetAt: entry.lastRefill + WINDOW_MS };
  }

  entry.tokens -= 1;
  return { allowed: true, remaining: entry.tokens, resetAt: entry.lastRefill + WINDOW_MS };
}

// ─── Middleware ─────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // ── Rate Limiting for API routes ──────────────────────────
  if (pathname.startsWith("/api/v1/")) {
    const result = edgeRateLimit(ip);

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
            "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", MAX_REQUESTS.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000).toString());
    return response;
  }

  // ── Admin route protection ────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Allow the admin login page itself
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const sessionToken =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Note: Full role verification (ADMIN check) happens server-side in
    // admin layouts/pages via verifyAdminSession(). Middleware only checks
    // that a session cookie exists to avoid unnecessary redirects.
    return NextResponse.next();
  }

  // ── Staff route protection ────────────────────────────────
  if (pathname.startsWith("/staff")) {
    // Allow the staff login page itself
    if (pathname === "/staff/login" || pathname === "/staff-login") {
      return NextResponse.next();
    }

    const staffSession = request.cookies.get("staff-session")?.value;

    if (!staffSession) {
      const loginUrl = new URL("/staff-login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

// ─── Matcher ────────────────────────────────────────────────

export const config = {
  matcher: [
    "/api/v1/:path*",
    "/admin/:path*",
    "/staff/:path*",
  ],
};
