import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { authenticate, ensureRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/modules/courses/schemas/course";

type CourseWithRelations = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  duration: number;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    bio: string | null;
    expertise: string | null;
    user: { id: string; name: string; email: string };
  } | null;
  enrollments?: { userId: string }[];
  _count: { enrollments: number };
};

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  isPublished: z.string().optional(),
  creatorId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Allow public access for browsing courses
    const auth = await authenticate(request).catch(() => null);
    const isAuthenticated = auth && !("response" in auth);

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      level: searchParams.get("level") || undefined,
      isPublished: searchParams.get("isPublished") || undefined,
      creatorId: searchParams.get("creatorId") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
    }

    const { search, category, level, isPublished, creatorId } = parsed.data;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;
    if (level) where.level = level;

    // Handle isPublished filter
    if (isPublished !== undefined) {
      where.isPublished = isPublished === "true";
    }

    // Role-based filtering
    if (isAuthenticated) {
      if (auth.user.role === "STUDENT") {
        // Students only see published courses
        where.isPublished = true;
      } else if (auth.user.role === "CREATOR") {
        // Creators see their own courses
        const creator = await prisma.creator.findUnique({
          where: { userId: auth.user.id },
        });
        if (creator) {
          where.creatorId = creator.id;
        } else {
          // Creator profile doesn't exist yet, return empty
          return NextResponse.json({ data: [] });
        }
      }
    } else {
      // Public access: only show published courses
      where.isPublished = true;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    const courses = (await prisma.course.findMany({
      where,
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
      },
      orderBy: { createdAt: "desc" },
    })) as CourseWithRelations[];

    return NextResponse.json({
      data: courses.map((course) => ({
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
              user: course.creator.user,
            }
          : null,
        enrollmentCount: course._count.enrollments,
        isEnrolled:
          isAuthenticated &&
          auth.user.role === "STUDENT" &&
          Array.isArray(course.enrollments) &&
          course.enrollments.length > 0,
      })),
    });
  } catch (error) {
    console.error("Courses fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const guard = ensureRole(auth.user, ["CREATOR", "ADMIN"]);
  if (guard) return guard;

  try {
    const body = await request.json();
    const payload = courseSchema.parse({
      ...body,
      price: Number(body.price),
      duration: Number(body.duration),
    });

    // Ensure creator profile exists
    let creator = await prisma.creator.findUnique({
      where: { userId: auth.user.id },
    });

    if (!creator) {
      // Create creator profile if it doesn't exist
      creator = await prisma.creator.create({
        data: {
          userId: auth.user.id,
        },
      });
    }

    const course = await prisma.course.create({
      data: {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        level: payload.level,
        price: payload.price,
        duration: payload.duration,
        imageUrl: payload.imageUrl,
        isPublished: payload.isPublished,
        creatorId: creator.id,
      },
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
    });

    return NextResponse.json(
      {
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
            user: course.creator.user,
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

    console.error("Course creation error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
