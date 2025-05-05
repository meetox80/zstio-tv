import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../css/globals.css";
import "../css/fa/css/all.css";
import AuthProvider from "@/components/AuthProvider";
import "aos/dist/aos.css";
import AOSInitializer from "@/components/AOSInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'zstio-tv@v2',
  description: 'Your app description'
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
        <AOSInitializer />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
