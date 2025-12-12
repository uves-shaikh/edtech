import { NextRequest, NextResponse } from "next/server";

import { authenticate, ensureRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const guard = ensureRole(auth.user, ["STUDENT"]);
  if (guard) return guard;

  try {
    const { courseId } = await params;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: auth.user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 },
      );
    }

    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId: auth.user.id,
          courseId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unenrollment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

