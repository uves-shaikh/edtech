import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { authenticate, ensureRole, forbidden } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/modules/courses/schemas/course";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Allow public access for viewing course details
    const auth = await authenticate(request).catch(() => null);
    const isAuthenticated = auth && !("response" in auth);

    const where: Prisma.CourseWhereUniqueInput = { id };

    const include: Prisma.CourseInclude = {
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
      enrollments:
        isAuthenticated && auth.user.role === "STUDENT"
          ? {
              where: { userId: auth.user.id },
            }
          : undefined,
      _count: {
        select: {
          enrollments: true,
        },
      },
    };

    const course = await prisma.course.findUnique({
      where,
      include,
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Students and public can only see published courses
    if (
      (!isAuthenticated || auth.user.role === "STUDENT") &&
      !course.isPublished
    ) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: Number(course.price),
        duration: course.duration,
        imageUrl: course.imageUrl,
        isPublished: course.isPublished,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        creator: course.creator
          ? {
              id: course.creator.id,
              bio: course.creator.bio,
              expertise: course.creator.expertise,
              user: course.creator,
            }
          : null,
        enrollmentCount: course._count.enrollments,
        isEnrolled:
          isAuthenticated &&
          auth.user.role === "STUDENT" &&
          Array.isArray(course.enrollments) &&
          course.enrollments.length > 0,
      },
    });
  } catch (error) {
    console.error("Course fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const guard = ensureRole(auth.user, ["CREATOR", "ADMIN"]);
  if (guard) return guard;

  const courseWhere: Prisma.CourseWhereUniqueInput = { id };
  const courseInclude: Prisma.CourseInclude = {
    creator: true,
  };

  const existing = await prisma.course.findUnique({
    where: courseWhere,
    include: courseInclude,
  });

  if (!existing) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Check ownership: creator must own the course, or be admin
  if (auth.user.role !== "ADMIN") {
    const creatorWhere: Prisma.CreatorWhereUniqueInput = {
      userId: auth.user.id,
    };
    const creator = await prisma.creator.findUnique({
      where: creatorWhere,
    });
    if (!creator || existing.creatorId !== creator.id) {
      return forbidden();
    }
  }

  try {
    const body = await request.json();
    const payload = courseSchema.parse({
      ...body,
      price: Number(body.price),
      duration: Number(body.duration),
    });

    const updateWhere: Prisma.CourseWhereUniqueInput = { id };
    const updateData: Prisma.CourseUpdateInput = {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      level: payload.level,
      price: payload.price,
      duration: payload.duration,
      imageUrl: payload.imageUrl,
      isPublished: payload.isPublished,
    };
    const updateInclude: Prisma.CourseInclude = {
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
    };

    const course = await prisma.course.update({
      where: updateWhere,
      data: updateData,
      include: updateInclude,
    });

    return NextResponse.json({
      data: {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: Number(course.price),
        duration: course.duration,
        imageUrl: course.imageUrl,
        isPublished: course.isPublished,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        creator: {
          id: course.creator.id,
          bio: course.creator.bio,
          expertise: course.creator.expertise,
          user: course.creator,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Course update error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const guard = ensureRole(auth.user, ["CREATOR", "ADMIN"]);
  if (guard) return guard;

  const courseWhere: Prisma.CourseWhereUniqueInput = { id };
  const courseInclude: Prisma.CourseInclude = {
    creator: true,
  };

  const existing = await prisma.course.findUnique({
    where: courseWhere,
    include: courseInclude,
  });

  if (!existing) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Check ownership: creator must own the course, or be admin
  if (auth.user.role !== "ADMIN") {
    const creatorWhere: Prisma.CreatorWhereUniqueInput = {
      userId: auth.user.id,
    };
    const creator = await prisma.creator.findUnique({
      where: creatorWhere,
    });
    if (!creator || existing.creatorId !== creator.id) {
      return forbidden();
    }
  }

  const deleteWhere: Prisma.CourseWhereUniqueInput = { id };
  await prisma.course.delete({ where: deleteWhere });

  return NextResponse.json({ success: true });
}
