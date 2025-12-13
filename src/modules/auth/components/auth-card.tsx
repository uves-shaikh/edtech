"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SigninPayload, SignupPayload } from "@/modules/auth/schemas/auth";
import { signinSchema, signupSchema } from "@/modules/auth/schemas/auth";

type SigninProps = {
  variant: "signin";
  onSubmit: (values: SigninPayload) => Promise<unknown> | unknown;
  loading?: boolean;
};

type SignupProps = {
  variant: "signup";
  onSubmit: (values: SignupPayload) => Promise<unknown> | unknown;
  loading?: boolean;
};

type AuthCardProps = SigninProps | SignupProps;

export function AuthCard({ variant, onSubmit, loading }: AuthCardProps) {
  const isSignup = variant === "signup";

  const form = useForm<SignupPayload | SigninPayload>({
    resolver: zodResolver(isSignup ? signupSchema : signinSchema),
    defaultValues: isSignup
      ? { name: "", email: "", password: "", role: "CREATOR" }
      : { email: "", password: "" },
  });

  const title = useMemo(
    () => (variant === "signin" ? "Welcome back" : "Create your account"),
    [variant]
  );
  const description = useMemo(
    () =>
      variant === "signin"
        ? "Access your creator workspace"
        : "Spin up your creator workspace",
    [variant]
  );

  async function handleSubmit(values: SignupPayload | SigninPayload) {
    try {
      // TypeScript can't infer that variant narrows the payload type, but runtime guarantees match
      // @ts-expect-error - variant prop ensures correct payload type at runtime
      await onSubmit(values);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unexpected error");
      }
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <ShieldCheck className="size-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4"
          >
            {isSignup && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alex Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="alex@studio.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSignup && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I want to</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">Learn courses</SelectItem>
                          <SelectItem value="CREATOR">
                            Create courses
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              {variant === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
