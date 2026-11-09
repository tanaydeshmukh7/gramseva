import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 200): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    if (value === debouncedValue) {
      setIsPending(false);
      return;
    }

    setIsPending(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs, debouncedValue]);

  return [debouncedValue, isPending];
}
