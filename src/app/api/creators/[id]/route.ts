import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const creatorWhere: Prisma.CreatorWhereUniqueInput = { id };

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
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
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
  } catch (error) {
    console.error("Creator fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
