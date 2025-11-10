import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ScrollProgress } from "@/components/ScrollProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wallpaper Chat – Private Messaging Hidden In Plain Sight",
  description:
    "A privacy-first messenger disguised as a wallpaper app. Launch encrypted, deniable communications for high-trust communities.",
  openGraph: {
    title: "Wallpaper Chat",
    description:
      "Secure, disguised messaging with stealth notifications and a premium wallpaper cover story.",
    url: "https://wallpaperchat.app",
    siteName: "Wallpaper Chat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wallpaper Chat – Private Messaging Hidden In Plain Sight",
    description:
      "Encrypted messaging, disguised notifications, and wallpaper-first UX for privacy-first communities.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
