import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./os.css";

const sora = localFont({
  src: [
    { path: "../fonts/sora-400.ttf", weight: "400", style: "normal" },
    { path: "../fonts/sora-600.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-sora",
  display: "swap",
});
const mono = localFont({
  src: "../fonts/share-tech-mono.ttf",
  weight: "400",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Escape the Hack 2.0",
  description: "System Breach — een digitale escape room voor Flitz-events.",
  applicationName: "Escape the Hack 2.0",
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
