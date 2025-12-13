"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a value to reduce frequent updates (e.g., search input, API calls)
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before updating (default: 500ms)
 * @returns The debounced value that updates after the delay period
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
