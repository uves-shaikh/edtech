import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { authenticate, ensureRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const enrollmentSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const guard = ensureRole(auth.user, ["STUDENT", "CREATOR", "ADMIN"]);
  if (guard) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const where: Prisma.EnrollmentWhereInput = {
      userId: auth.user.id,
      ...(courseId && { courseId }),
    };

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        course: {
          include: {
            creator: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return NextResponse.json({
      data: enrollments.map((enrollment) => ({
        id: enrollment.id,
        courseId: enrollment.courseId,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          category: enrollment.course.category,
          level: enrollment.course.level,
          price: Number(enrollment.course.price),
          duration: enrollment.course.duration,
          imageUrl: enrollment.course.imageUrl,
          isPublished: enrollment.course.isPublished,
          createdAt: enrollment.course.createdAt.toISOString(),
          creator: enrollment.course.creator
            ? {
                id: enrollment.course.creator.id,
                bio: enrollment.course.creator.bio,
                expertise: enrollment.course.creator.expertise,
                user: enrollment.course.creator.user,
              }
            : null,
        },
      })),
    });
  } catch (error) {
    console.error("Enrollments fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const guard = ensureRole(auth.user, ["STUDENT"]);
  if (guard) return guard;

  try {
    const body = await request.json();
    const { courseId } = enrollmentSchema.parse(body);

    // Validate course exists and is published before allowing enrollment
    const courseWhere: Prisma.CourseWhereUniqueInput = { id: courseId };
    const course = await prisma.course.findUnique({
      where: courseWhere,
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!course.isPublished) {
      return NextResponse.json(
        { error: "Course is not available for enrollment" },
        { status: 400 }
      );
    }

    // Prevent duplicate enrollments using composite unique constraint
    const enrollmentWhere: Prisma.EnrollmentWhereUniqueInput = {
      userId_courseId: {
        userId: auth.user.id,
        courseId,
      },
    };

    const existing = await prisma.enrollment.findUnique({
      where: enrollmentWhere,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    const enrollmentData: Prisma.EnrollmentCreateInput = {
      user: {
        connect: { id: auth.user.id },
      },
      course: {
        connect: { id: courseId },
      },
    };

    const enrollment = await prisma.enrollment.create({
      data: enrollmentData,
      include: {
        course: {
          include: {
            creator: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: {
          id: enrollment.id,
          courseId: enrollment.courseId,
          enrolledAt: enrollment.enrolledAt.toISOString(),
          course: {
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            category: enrollment.course.category,
            level: enrollment.course.level,
            price: Number(enrollment.course.price),
            duration: enrollment.course.duration,
            imageUrl: enrollment.course.imageUrl,
            isPublished: enrollment.course.isPublished,
            createdAt: enrollment.course.createdAt.toISOString(),
            creator: enrollment.course.creator
              ? {
                  id: enrollment.course.creator.id,
                  bio: enrollment.course.creator.bio,
                  expertise: enrollment.course.creator.expertise,
                  user: enrollment.course.creator.user,
                }
              : null,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
