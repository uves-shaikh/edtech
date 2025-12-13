"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "CREATOR" | "ADMIN";
}

interface UserResponse {
  user: User;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  setUser: (user: User | null) => void;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// localStorage flag to optimize auth checks: skip API call if user never logged in this session
const AUTH_FLAG_KEY = "auth_attempted";

function hasAuthFlag(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_FLAG_KEY) === "true";
}

function setAuthFlag(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(AUTH_FLAG_KEY, "true");
  } else {
    localStorage.removeItem(AUTH_FLAG_KEY);
  }
}

async function fetchCurrentUser(): Promise<UserResponse> {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (!response.ok) {
    // 401 indicates unauthenticated state: clear localStorage flag to prevent future unnecessary calls
    if (response.status === 401) {
      setAuthFlag(false);
      const body = await response.json().catch(() => ({}));
      const errorMessage = body.error || "Not authenticated";
      throw new Error(errorMessage);
    }

    const body = await response.json().catch(() => ({}));
    const errorMessage = body.error || "Failed to fetch user";
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role as "STUDENT" | "CREATOR" | "ADMIN",
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    // Performance optimization: skip API call if localStorage indicates no previous auth attempt
    if (!hasAuthFlag()) {
      setIsLoading(false);
      setUserState(null);
      setIsError(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      const data = await fetchCurrentUser();
      setUserState(data.user);
      // Persist auth flag to optimize subsequent page loads
      setAuthFlag(true);
    } catch (err) {
      // Distinguish between "not logged in" (expected state) vs actual errors (network, server issues)
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (errorMessage === "Not authenticated") {
        setIsError(false);
        setError(null);
        setUserState(null);
        setAuthFlag(false);
      } else {
        setIsError(true);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setUserState(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    setIsError(false);
    setError(null);
    // Sync localStorage flag with current auth state for optimization
    if (newUser) {
      setAuthFlag(true);
    } else {
      setAuthFlag(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isError, error, setUser, refetch: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
