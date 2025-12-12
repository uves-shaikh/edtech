import { NextRequest, NextResponse } from "next/server";

import { authenticate } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const result = await authenticate(request);

  if ("response" in result) {
    return result.response;
  }

  const { user } = result;
  const { password: _, ...safeUser } = user;

  return NextResponse.json({ user: safeUser });
}
