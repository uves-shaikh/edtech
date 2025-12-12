import jwt from "jsonwebtoken";
import type { NextRequest, NextResponse } from "next/server";

type Role = "STUDENT" | "CREATOR" | "ADMIN";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export const AUTH_COOKIE = "auth_token";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: Role;
};

export function generateToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

export function getTokenFromRequest(request: NextRequest) {
  const headerToken = request.headers.get("authorization");
  if (headerToken?.startsWith("Bearer ")) {
    return headerToken.replace("Bearer ", "");
  }

  const cookieToken = request.cookies.get(AUTH_COOKIE)?.value;
  return cookieToken || null;
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
