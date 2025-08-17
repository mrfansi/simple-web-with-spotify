import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import FloatingPlayer from '@/components/spotify/FloatingPlayer';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simple Web with Spotify",
  description: "A modern web application with integrated Spotify music player",
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
        {children}
        <FloatingPlayer />
      </body>
    </html>
  );
}
