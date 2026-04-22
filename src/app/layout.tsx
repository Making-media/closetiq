import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClosetIQ — AI Wardrobe Stylist",
  description:
    "ClosetIQ uses AI to scan, classify, and style everything in your closet. Get personalized outfit suggestions and build a wardrobe that works.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${inter.className} bg-black text-white antialiased min-h-full flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
