import { TrendingUp, Users, Wand2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatProps = {
  total: number;
  published: number;
  avgPrice: number;
  totalEnrollments: number;
  loading?: boolean;
};

export function StatsCards({
  total,
  published,
  avgPrice,
  totalEnrollments,
  loading,
}: StatProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Total courses</CardDescription>
          <CardTitle>{total}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Published courses</CardDescription>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-emerald-500" />
            {published}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Avg price (₹)</CardDescription>
          <CardTitle>{avgPrice.toFixed(0)}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Total enrollments</CardDescription>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-indigo-500" />
            {totalEnrollments}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
