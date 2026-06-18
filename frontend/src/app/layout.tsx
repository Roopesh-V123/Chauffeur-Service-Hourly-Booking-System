/**
 * @file layout.tsx
 * @description The HTML root layout component for the Chauffeur Service Hourly Booking System.
 * Handles metadata setup, font loading, global styling initialization, and responsive canvas wrapper configuration.
 * 
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Chauffeur Service Hourly Booking System — Manivtha Tours & Travels",
  description: "Premium digital dispatch, reservation tracking, and dynamic billing engine for luxury travel services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
