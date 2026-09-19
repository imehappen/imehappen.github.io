/**
 * Template — remounts on every route change, so the entrance animation in
 * `.page-transition` replays as a smooth fade-up between pages.
 * (globals.css; disabled under prefers-reduced-motion by the global rule.)
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
