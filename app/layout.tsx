import type { Metadata, Viewport } from "next";
import { Share_Tech_Mono, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const mono = Share_Tech_Mono({ subsets: ["latin"], weight: "400", variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Escape the Hack 2.0",
  description: "System Breach — een digitale escape room voor Flitz-events.",
  applicationName: "Escape the Hack 2.0",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  appleWebApp: { capable: true, title: "Escape the Hack", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#070b12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${sora.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
