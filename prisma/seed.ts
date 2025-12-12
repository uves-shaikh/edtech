import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Users
  const student = await prisma.user.create({
    data: {
      id: "clu1userstd001",
      email: "student1@example.com",
      password: "hashedpassword123",
      name: "Rahul Sharma",
      role: "STUDENT",
    },
  });

  const creatorUser = await prisma.user.create({
    data: {
      id: "clu1usercrt001",
      email: "creator@example.com",
      password: "hashedpassword456",
      name: "Ananya Verma",
      role: "CREATOR",
    },
  });

  const creatorUser2 = await prisma.user.create({
    data: {
      id: "clu1usercrt002",
      email: "priya.iyer@iitb.ac.in",
      password: "hashedpassword789",
      name: "Priya Iyer",
      role: "CREATOR",
    },
  });

  const creatorUser3 = await prisma.user.create({
    data: {
      id: "clu1usercrt003",
      email: "vikram.kapoor@iiitd.edu",
      password: "hashedpassword321",
      name: "Vikram Kapoor",
      role: "CREATOR",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: "clu1useradm001",
      email: "admin@edtech.in",
      password: "hashedpasswordadmin",
      name: "Asha Menon",
      role: "ADMIN",
    },
  });

  // 2. Creator Profile
  const creator = await prisma.creator.create({
    data: {
      id: "clu1creator001",
      userId: "clu1usercrt001",
      bio: "Full-stack developer with 5+ years of experience specializing in JavaScript, TypeScript, and cloud-native architectures.",
      expertise: "Web Development, Node.js, Next.js, PostgreSQL",
    },
  });

  const creator2 = await prisma.creator.create({
    data: {
      id: "clu1creator002",
      userId: creatorUser2.id,
      bio: "Assistant Professor at IIT Bombay focusing on data systems and applied machine learning.",
      expertise: "Data Engineering, Machine Learning, Spark, Python",
    },
  });

  const creator3 = await prisma.creator.create({
    data: {
      id: "clu1creator003",
      userId: creatorUser3.id,
      bio: "Former Flipkart SRE leading reliability programs across payments and logistics.",
      expertise: "Site Reliability, Kubernetes, Observability, Cloud",
    },
  });

  // 3. Courses
  const course1 = await prisma.course.create({
    data: {
      id: "clu1course001",
      title: "Complete JavaScript Bootcamp",
      description:
        "A beginner-friendly, hands-on JavaScript course covering ES6, DOM, async programming, and practical projects.",
      price: 1499,
      duration: 30,
      level: "BEGINNER",
      category: "Programming",
      imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      isPublished: true,
      creatorId: creator.id,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      id: "clu1course002",
      title: "Advanced React & Next.js",
      description:
        "Master server components, routing, caching, authentication, and production patterns in Next.js.",
      price: 2499,
      duration: 40,
      level: "ADVANCED",
      category: "Web Development",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      isPublished: true,
      creatorId: creator.id,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      id: "clu1course003",
      title: "PostgreSQL for Developers",
      description:
        "Practical SQL, schemas, indexing, migrations, and query optimization for production systems.",
      price: 999,
      duration: 20,
      level: "INTERMEDIATE",
      category: "Database",
      imageUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
      isPublished: false,
      creatorId: creator.id,
    },
  });

  const course4 = await prisma.course.create({
    data: {
      id: "clu1course004",
      title: "Data Engineering with Indian Railways Data",
      description:
        "Build ETL pipelines on open Indian Railways datasets using Python, Pandas, and Apache Spark. Includes partitioning, scheduling, and quality checks.",
      price: 1899,
      duration: 32,
      level: "INTERMEDIATE",
      category: "Data Engineering",
      imageUrl: "https://images.unsplash.com/photo-1521791055366-0d553872125f",
      isPublished: true,
      creatorId: creator2.id,
    },
  });

  const course5 = await prisma.course.create({
    data: {
      id: "clu1course005",
      title: "Applied Machine Learning with Aadhaar & NPCI Case Studies",
      description:
        "End-to-end ML workflows covering feature stores, model governance, and drift monitoring using public Aadhaar enrollment stats and UPI transaction trends.",
      price: 2799,
      duration: 45,
      level: "ADVANCED",
      category: "Machine Learning",
      imageUrl:
        "https://files.codingninjas.in/article_images/case-based-reasoning-in-machine-learning-0-1689445515.webp",
      isPublished: true,
      creatorId: creator2.id,
    },
  });

  const course6 = await prisma.course.create({
    data: {
      id: "clu1course006",
      title: "SRE Playbook from Flipkart & UPI-scale Systems",
      description:
        "Hands-on reliability engineering with Kubernetes, Prometheus, Grafana, chaos drills, and incident runbooks inspired by large-scale Indian commerce and payments systems.",
      price: 2199,
      duration: 36,
      level: "ADVANCED",
      category: "DevOps",
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
      isPublished: true,
      creatorId: creator3.id,
    },
  });

  const course7 = await prisma.course.create({
    data: {
      id: "clu1course007",
      title: "Cloud Cost Optimization for Indian Startups",
      description:
        "Strategies used by Bengaluru and Hyderabad SaaS teams to control AWS and GCP spend with autoscaling, Spot instances, and FinOps dashboards.",
      price: 1599,
      duration: 18,
      level: "INTERMEDIATE",
      category: "Cloud",
      imageUrl: "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e",
      isPublished: false,
      creatorId: creator3.id,
    },
  });

  // 4. Enrollments
  await prisma.enrollment.create({
    data: {
      id: "clu1enroll001",
      userId: student.id,
      courseId: course1.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      id: "clu1enroll002",
      userId: student.id,
      courseId: course2.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      id: "clu1enroll003",
      userId: creatorUser.id,
      courseId: course3.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      id: "clu1enroll004",
      userId: creatorUser2.id,
      courseId: course4.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      id: "clu1enroll005",
      userId: creatorUser3.id,
      courseId: course6.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      id: "clu1enroll006",
      userId: adminUser.id,
      courseId: course5.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      id: "clu1enroll007",
      userId: student.id,
      courseId: course6.id,
    },
  });

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
