import { Button } from "@/components/Button";

/**
 * App Router not-found page. Also works around a Next.js static-export
 * quirk where, without an explicit not-found route, the export step falls
 * back to a legacy pages-router "_document" 404 render path that errors
 * ("<Html> should not be imported outside of pages/_document") — defining
 * this page makes export use the App Router 404 path instead.
 */
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        textAlign: "center",
        padding: 24,
      }}
    >
      <h1 className="font-display" style={{ fontSize: "clamp(32px,6vw,64px)" }}>
        Route Not Found
      </h1>
      <p className="text-w70">That page doesn&apos;t exist. Head back to the homepage.</p>
      <Button href="/">Back to Home</Button>
    </main>
  );
}
