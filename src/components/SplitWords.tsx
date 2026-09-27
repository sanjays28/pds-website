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
        // The inter-word space is a SIBLING of split-word-wrap, not a child
        // of it — split-word-wrap is overflow:hidden + inline-block (for
        // the word-mask reveal), and a trailing space *inside* that box
        // gets trimmed to zero width by shrink-to-fit sizing, silently
        // collapsing every multi-word heading into one run-on word.
        <span key={i}>
          <span className="split-word-wrap">
            <span className={className ? `split-word ${className}` : "split-word"}>{word}</span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}
