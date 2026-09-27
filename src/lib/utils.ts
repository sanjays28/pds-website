/** Minimal classnames joiner — avoids pulling in clsx/tailwind-merge for one function. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Shallow-omit by key, typed. Used to strip component-only props before
 * spreading the rest onto a native element. */
export function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) delete result[key];
  return result;
}
