import { NextRequest, NextResponse } from "next/server";

import { authenticate, ensureRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    const isAuthenticated = !("response" in auth);

    // Public stats (available to all)
    const [
      totalCourses,
      publishedCourses,
      totalStudents,
      totalCreators,
      totalEnrollments,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "CREATOR" } }),
      prisma.enrollment.count(),
    ]);

    const stats = {
      totalCourses,
      publishedCourses,
      totalStudents,
      totalCreators,
      totalEnrollments,
      averageEnrollmentsPerCourse:
        publishedCourses > 0 ? totalEnrollments / publishedCourses : 0,
    };

    // Add role-specific stats if authenticated
    if (isAuthenticated) {
      if (auth.user.role === "CREATOR") {
        const creator = await prisma.creator.findUnique({
          where: { userId: auth.user.id },
        });

        if (creator) {
          const creatorCourses = await prisma.course.count({
            where: { creatorId: creator.id },
          });
          const creatorPublishedCourses = await prisma.course.count({
            where: { creatorId: creator.id, isPublished: true },
          });
          const creatorEnrollments = await prisma.enrollment.count({
            where: {
              course: {
                creatorId: creator.id,
              },
            },
          });

          return NextResponse.json({
            ...stats,
            creator: {
              totalCourses: creatorCourses,
              publishedCourses: creatorPublishedCourses,
              totalEnrollments: creatorEnrollments,
            },
          });
        }
      } else if (auth.user.role === "STUDENT") {
        const studentEnrollments = await prisma.enrollment.count({
          where: { userId: auth.user.id },
        });

        return NextResponse.json({
          ...stats,
          student: {
            enrolledCourses: studentEnrollments,
          },
        });
      } else if (auth.user.role === "ADMIN") {
        // Admin gets all stats
        const coursesByCategory = await prisma.course.groupBy({
          by: ["category"],
          _count: true,
          where: { isPublished: true },
        });

        const coursesByLevel = await prisma.course.groupBy({
          by: ["level"],
          _count: true,
          where: { isPublished: true },
        });

        return NextResponse.json({
          ...stats,
          admin: {
            coursesByCategory: coursesByCategory.map((item) => ({
              category: item.category,
              count: item._count,
            })),
            coursesByLevel: coursesByLevel.map((item) => ({
              level: item.level,
              count: item._count,
            })),
          },
        });
      }
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

