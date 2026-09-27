/**
 * Manual word-span splitter for M02 (headline slide-up + unblur).
 * GSAP's SplitText is a paid Club plugin (see registry M02 note), so
 * headlines are split into `.split-word` spans at render time instead —
 * Section/Hero then animate each span's transform+opacity via GSAP.
 */
export function SplitWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={i} className="split-word-wrap">
          <span className={className ? `split-word ${className}` : "split-word"}>{word}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}
