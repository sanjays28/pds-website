import { cn } from "@/lib/utils";

/**
 * TagList — plain label chips (industries served, and the "Why Choose PDS"
 * points). Not a WMS §8 component by name; it's the smallest shared piece
 * that covers both "industries served as tags underneath [Services]" and
 * the 8 Why-Choose-PDS points, which content.md gives only as short labels
 * with no body copy — too thin to force into <Card> (WMS §8 PillarCard
 * expects title+body) without inventing filler sentences, which Prompt 2's
 * brief explicitly says not to do.
 */
export function TagList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("tag-list", className)}>
      {items.map((item) => (
        <li key={item} className="tag">
          {item}
        </li>
      ))}
    </ul>
  );
}
