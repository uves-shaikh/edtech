"use client";

import { BookOpen, LayoutDashboard, Loader2, Menu, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useSignout } from "@/modules/auth/hooks/use-auth";

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useCurrentUser();
  const signout = useSignout();

  const user = data?.user;

  const handleLogout = async () => {
    await signout.mutateAsync();
    router.push("/");
    setIsOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link
        href="/courses"
        className="text-sm hover:text-foreground/80 transition-colors py-2 md:py-0"
        onClick={() => setIsOpen(false)}
      >
        Courses
      </Link>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 md:py-0">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading...
        </div>
      ) : user ? (
        <>
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="md:contents"
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full md:w-auto justify-start md:justify-center"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2 py-2 md:py-0">
            <User className="h-4 w-4" />
            <span className="text-sm">{user.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={signout.isPending}
            aria-busy={signout.isPending}
            className="w-full md:w-auto justify-start md:justify-center"
          >
            {signout.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
            )}
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link
            href="/sign-in"
            onClick={() => setIsOpen(false)}
            className="md:contents"
          >
            <Button variant="ghost" size="sm" className="w-full md:w-auto">
              Sign in
            </Button>
          </Link>
          <Link
            href="/sign-up"
            onClick={() => setIsOpen(false)}
            className="md:contents"
          >
            <Button size="sm" className="w-full md:w-auto">
              Sign up
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="border-b border-foreground/20 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg sm:text-xl"
          >
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:inline">EdTech Platform</span>
            <span className="sm:hidden">EdTech</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <NavLinks />
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 pt-2 flex flex-col gap-3 border-t border-foreground/10">
            <NavLinks />
          </div>
        )}
      </div>
    </nav>
  );
}
