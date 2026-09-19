import type { Metadata, Viewport } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SocketProvider } from "@/components/socket-provider";
import { ScrollProgress, BackToTop } from "@/components/scroll-ui";
import { getSiteSettings } from "@/lib/site-content";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Title / description / site name come from Admin → Site Settings → Identity & SEO. */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: s.seoTitle,
      template: `%s · ${s.siteName}`,
    },
    description: s.seoDescription,
    openGraph: {
      type: "website",
      siteName: s.siteName,
      url: siteUrl,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#020617",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { motion } = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${spaceGrotesk.variable}`}
      // Motion switches from Admin → Site Settings → Motion; globals.css keys
      // its reduced-motion / page-transition / reveal rules off these.
      data-motion={motion.respectReducedMotion ? "respect" : "always"}
      data-page-transitions={motion.pageTransitions ? "on" : "off"}
      data-reveals={motion.scrollReveals ? "on" : "off"}
    >
      {/* suppressHydrationWarning: browser extensions (Grammarly etc.) inject
          attributes like data-gr-ext-installed onto <body> before React loads. */}
      <body className="font-body" suppressHydrationWarning>
        <SocketProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
          >
            Skip to content
          </a>
          {/* No-JS fallback: Reveal starts hidden via CSS; without JS the
              IntersectionObserver never fires, so force-show content. */}
          <noscript>
            <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
          </noscript>
          <ScrollProgress />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <BackToTop />
        </SocketProvider>
      </body>
    </html>
  );
}
