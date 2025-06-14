import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "../config/providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { LowerNavbar, UpperNavbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col min-h-full">
            <UpperNavbar />
            <main className="flex-1 overflow-y-auto pb-16">
              {children}
            </main>
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <LowerNavbar />
            </div>
            
            <footer className="w-full flex items-center justify-center py-3 mb-24">
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://ashokgupta.netlify.app/"
                title="Ashok gupta portfolio"
              >
                <span className="text-default-600">Loopz by.</span>
                <p className="text-primary">Ashok Gupta</p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
