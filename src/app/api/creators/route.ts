import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { authenticate, ensureRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const creatorUpdateSchema = z.object({
  bio: z.string().optional(),
  expertise: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Query parameter provided: fetch specific creator profile by user ID
      const creatorWhere: Prisma.CreatorWhereUniqueInput = { userId };

      const creator = await prisma.creator.findUnique({
        where: creatorWhere,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          courses: {
            where: { isPublished: true },
            include: {
              _count: {
                select: {
                  enrollments: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!creator) {
        return NextResponse.json(
          { error: "Creator not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: {
          id: creator.id,
          bio: creator.bio,
          expertise: creator.expertise,
          createdAt: creator.createdAt.toISOString(),
          updatedAt: creator.updatedAt.toISOString(),
          user: creator.user,
          courses: creator.courses.map((course) => ({
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
            enrollmentCount: course._count.enrollments,
          })),
        },
      });
    }

    // List all creators (public)
    const creatorsInclude: Prisma.CreatorInclude = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          courses: true,
        },
      },
    };

    const creators = await prisma.creator.findMany({
      include: creatorsInclude,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: creators.map((creator) => ({
        id: creator.id,
        bio: creator.bio,
        expertise: creator.expertise,
        createdAt: creator.createdAt.toISOString(),
        user: creator.user,
        courseCount: creator._count.courses,
      })),
    });
  } catch (error) {
    console.error("Creators fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;

  const guard = ensureRole(auth.user, ["CREATOR", "ADMIN"]);
  if (guard) return guard;

  try {
    const body = await request.json();
    const payload = creatorUpdateSchema.parse(body);

    const creatorWhere: Prisma.CreatorWhereUniqueInput = {
      userId: auth.user.id,
    };

    let creator = await prisma.creator.findUnique({
      where: creatorWhere,
    });

    if (!creator) {
      // Create creator profile if it doesn't exist
      const creatorData: Prisma.CreatorCreateInput = {
        user: {
          connect: { id: auth.user.id },
        },
        bio: payload.bio,
        expertise: payload.expertise,
      };

      creator = await prisma.creator.create({
        data: creatorData,
      });
    } else {
      // Upsert pattern: update bio/expertise fields for existing creator profile
      const updateData: Prisma.CreatorUpdateInput = {
        bio: payload.bio,
        expertise: payload.expertise,
      };

      creator = await prisma.creator.update({
        where: creatorWhere,
        data: updateData,
      });
    }

    const creatorWithUserInclude: Prisma.CreatorInclude = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };

    const creatorWithUserWhere: Prisma.CreatorWhereUniqueInput = {
      id: creator.id,
    };

    const creatorWithUser = await prisma.creator.findUnique({
      where: creatorWithUserWhere,
      include: creatorWithUserInclude,
    });

    return NextResponse.json({
      data: {
        id: creatorWithUser!.id,
        bio: creatorWithUser!.bio,
        expertise: creatorWithUser!.expertise,
        createdAt: creatorWithUser!.createdAt.toISOString(),
        updatedAt: creatorWithUser!.updatedAt.toISOString(),
        user: creatorWithUser!.user,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Creator update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
