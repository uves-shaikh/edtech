import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { authenticate, ensureRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    const isAuthenticated = !("response" in auth);

    // Base statistics visible to all users (no authentication required)
    const publishedCoursesWhere: Prisma.CourseWhereInput = {
      isPublished: true,
    };
    const studentsWhere: Prisma.UserWhereInput = {
      role: "STUDENT",
    };
    const creatorsWhere: Prisma.UserWhereInput = {
      role: "CREATOR",
    };

    const [
      totalCourses,
      publishedCourses,
      totalStudents,
      totalCreators,
      totalEnrollments,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: publishedCoursesWhere }),
      prisma.user.count({ where: studentsWhere }),
      prisma.user.count({ where: creatorsWhere }),
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

    // Extend response with role-based statistics based on user permissions
    if (isAuthenticated) {
      if (auth.user.role === "CREATOR") {
        const creatorWhere: Prisma.CreatorWhereUniqueInput = {
          userId: auth.user.id,
        };

        const creator = await prisma.creator.findUnique({
          where: creatorWhere,
        });

        if (creator) {
          const creatorCoursesWhere: Prisma.CourseWhereInput = {
            creatorId: creator.id,
          };
          const creatorPublishedCoursesWhere: Prisma.CourseWhereInput = {
            creatorId: creator.id,
            isPublished: true,
          };
          const creatorEnrollmentsWhere: Prisma.EnrollmentWhereInput = {
            course: {
              creatorId: creator.id,
            },
          };

          const creatorCourses = await prisma.course.count({
            where: creatorCoursesWhere,
          });
          const creatorPublishedCourses = await prisma.course.count({
            where: creatorPublishedCoursesWhere,
          });
          const creatorEnrollments = await prisma.enrollment.count({
            where: creatorEnrollmentsWhere,
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
        const studentEnrollmentsWhere: Prisma.EnrollmentWhereInput = {
          userId: auth.user.id,
        };

        const studentEnrollments = await prisma.enrollment.count({
          where: studentEnrollmentsWhere,
        });

        return NextResponse.json({
          ...stats,
          student: {
            enrolledCourses: studentEnrollments,
          },
        });
      } else if (auth.user.role === "ADMIN") {
        // Admin access: include aggregated analytics (category/level breakdowns)
        const groupByWhere: Prisma.CourseWhereInput = {
          isPublished: true,
        };

        const coursesByCategory = await prisma.course.groupBy({
          by: ["category"],
          _count: true,
          where: groupByWhere,
        });

        const coursesByLevel = await prisma.course.groupBy({
          by: ["level"],
          _count: true,
          where: groupByWhere,
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
      { status: 500 }
    );
  }
}
