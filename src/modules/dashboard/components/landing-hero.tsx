"use client";

import { ArrowRight, CheckCircle2, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthCard } from "@/modules/auth/components/auth-card";
import type { SigninPayload, SignupPayload } from "@/modules/auth/schemas/auth";

type LandingHeroProps = {
  onSignin: (payload: SigninPayload) => Promise<unknown> | unknown;
  onSignup: (payload: SignupPayload) => Promise<unknown> | unknown;
  loading?: boolean;
};

const proofPoints = [
  "Secure JWT auth with granular roles",
  "Prisma + PostgreSQL modeling with RSC-friendly APIs",
  "AI-powered positioning via Gemini flash",
];

export function LandingHero({ onSignin, onSignup, loading }: LandingHeroProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge variant="outline">House of EdTech</Badge>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Built for Dec 2025 assignment
            </Badge>
          </div>
          <CardTitle className="text-3xl sm:text-4xl">
            Course Management Platform with Operational Guardrails
          </CardTitle>
          <CardDescription className="text-base">
            A full-stack Next.js 16 workspace that ships auth, CRUD, AI assists,
            and production-ready patterns out of the box.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {proofPoints.map((point) => (
              <div
                key={point}
                className="rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed"
              >
                <div className="mb-2 flex items-center gap-2 text-foreground">
                  <Sparkles className="size-4 text-amber-500" />
                  <span className="font-semibold">Launch</span>
                </div>
                {point}
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm">
              <Shield className="size-5 text-emerald-500" />
              <div>
                <p className="font-semibold">Secure by default</p>
                <p className="text-muted-foreground">
                  JWT cookies, server validation, and Prisma input sanitization.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="#auth">
                Explore the workspace
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div id="auth" className="grid gap-4 md:grid-cols-2">
        <AuthCard variant="signin" onSubmit={onSignin} loading={loading} />
        <AuthCard variant="signup" onSubmit={onSignup} loading={loading} />
      </div>

      <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Operational rigor",
            text: "Role-based CRUD, guarded API routes, and coherent error handling for scale.",
          },
          {
            title: "Creator growth",
            text: "Create and manage courses with ease. Test pricing, positioning, and formats quickly.",
          },
          {
            title: "AI assists",
            text: "Gemini-powered summaries to sharpen landing copy in seconds.",
          },
        ].map((item) => (
          <Card key={item.title} className="border-dashed">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Proof
                </span>
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.text}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
