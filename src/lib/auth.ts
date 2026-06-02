import { NextAuthOptions, getServerSession as _getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Account lockout configuration
const MAX_FAILED_ATTEMPTS = 3;
const FAILED_ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.toLowerCase().trim();
        const ipAddress =
          (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          (req?.headers?.["x-real-ip"] as string) ||
          "unknown";
        const userAgent = (req?.headers?.["user-agent"] as string) || "unknown";

        // Find user
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.hashedPassword) {
          // Log failed attempt even if user doesn't exist
          await db.loginAttempt.create({
            data: {
              email,
              ipAddress,
              userAgent,
              success: false,
              reason: "user_not_found",
            },
          });
          throw new Error("Invalid email or password");
        }

        // Check if user is banned
        if (user.isBanned) {
          await db.loginAttempt.create({
            data: {
              userId: user.id,
              email,
              ipAddress,
              userAgent,
              success: false,
              reason: "banned",
            },
          });
          throw new Error("Your account has been suspended. Contact support@piyrox.sbs");
        }

        // Check if account is locked out
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const remainingMs = user.lockedUntil.getTime() - Date.now();
          const remainingMin = Math.ceil(remainingMs / 60000);

          await db.loginAttempt.create({
            data: {
              userId: user.id,
              email,
              ipAddress,
              userAgent,
              success: false,
              reason: "locked_out",
            },
          });
          throw new Error(
            `Account locked. Try again in ${remainingMin} minute${remainingMin !== 1 ? "s" : ""}`
          );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          // Check if failed attempts are within the window
          const windowStart = new Date(Date.now() - FAILED_ATTEMPT_WINDOW_MS);
          let newFailedCount = user.failedLogins;

          if (user.lastFailedLogin && user.lastFailedLogin > windowStart) {
            newFailedCount += 1;
          } else {
            // Reset counter — previous failures are outside the window
            newFailedCount = 1;
          }

          const updateData: Record<string, unknown> = {
            failedLogins: newFailedCount,
            lastFailedLogin: new Date(),
          };

          // Lock account if too many failed attempts
          if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
            updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
            updateData.failedLogins = 0;
          }

          await db.user.update({
            where: { id: user.id },
            data: updateData,
          });

          await db.loginAttempt.create({
            data: {
              userId: user.id,
              email,
              ipAddress,
              userAgent,
              success: false,
              reason:
                newFailedCount >= MAX_FAILED_ATTEMPTS
                  ? "locked_out"
                  : "invalid_password",
            },
          });

          if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
            throw new Error("Too many failed attempts. Account locked for 15 minutes");
          }

          throw new Error("Invalid email or password");
        }

        // Successful login — reset failed attempts
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLogins: 0,
            lockedUntil: null,
            lastFailedLogin: null,
          },
        });

        await db.loginAttempt.create({
          data: {
            userId: user.id,
            email,
            ipAddress,
            userAgent,
            success: true,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Helper to retrieve the server-side session.
 * Usage: const session = await getServerSession();
 */
export async function getServerSession() {
  return _getServerSession(authOptions);
}
