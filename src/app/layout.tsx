import type { Metadata } from "next";
import { Afacad, Cousine } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const afacad = Afacad({
  subsets: ["latin"],
  variable: "--font-afacad",
  display: "swap",
  adjustFontFallback: false,
});

const cousine = Cousine({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cousine",
  display: "swap",
});

// Assuming we might have a local Cal Sans font later, setting up a fallback
const calSans = localFont({
  src: "./fonts/GeistVF.woff", // temporary fallback until Cal Sans is provided
  variable: "--font-calsans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Elf Jampad Booking",
  description: "Book your jam session at Elf Jampad, New Delhi.",
};

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${afacad.variable} ${cousine.variable} ${calSans.variable} font-sans antialiased bg-black text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
