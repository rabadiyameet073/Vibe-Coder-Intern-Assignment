// ─── useDebounce Hook ───────────────────────────────────────────────────────
// Debounces a rapidly-changing value (e.g., search input).
// Returns the debounced value after the specified delay.

import { useState, useEffect } from "react";

/**
 * @param value - The value to debounce
 * @param delayMs - Debounce delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 300);
 * // debouncedQuery updates 300ms after the last searchQuery change
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
