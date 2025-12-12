import Link from "next/link";
import { BookOpen, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen space-y-16">
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Learn Anything, Anytime, Anywhere
        </h1>
        <p className="text-lg sm:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
          Discover thousands of courses from expert instructors. Start your
          learning journey today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/courses">
            <Button size="lg" className="w-full sm:w-auto">
              Browse Courses
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-8">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 mb-4" />
              <CardTitle>Expert Instructors</CardTitle>
              <CardDescription>
                Learn from industry professionals with years of experience.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 mb-4" />
              <CardTitle>Community Learning</CardTitle>
              <CardDescription>
                Join thousands of students in interactive learning experiences.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 mb-4" />
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>
                Enhanced learning with AI-generated course content and
                descriptions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="bg-muted/60 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-4">
            <div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-foreground/60">Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-foreground/60">Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-foreground/60">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-foreground/60">Enrollments</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
