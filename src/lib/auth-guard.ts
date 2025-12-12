import { NextResponse, type NextRequest } from "next/server";

import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Role = "STUDENT" | "CREATOR" | "ADMIN";

type UserRecord = {
  id: string;
  email: string;
  name: string;
  password: string;
  role: Role;
};

type AuthResult = { user: UserRecord } | { response: NextResponse };

export async function authenticate(request: NextRequest): Promise<AuthResult> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { response: unauthorized("Missing token") };
  }

  try {
    const payload = verifyToken(token);
    const user = (await prisma.user.findUnique({
      where: { id: payload.userId },
    })) as UserRecord | null;

    if (!user) {
      return { response: unauthorized("User not found") };
    }

    return { user };
  } catch (error) {
    console.error("Authentication error", error);
    return { response: unauthorized("Invalid or expired token") };
  }
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function ensureRole(user: UserRecord, allowed: Role[]) {
  if (!allowed.includes(user.role)) {
    return forbidden();
  }

  return null;
}
