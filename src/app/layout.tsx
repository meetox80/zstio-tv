import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "../css/globals.css";
import "../css/fa/css/all.css";
import AuthProvider from "@/components/AuthProvider";
import "aos/dist/aos.css";
import AOSInitializer from "@/components/AOSInitializer";
import { ToastProvider } from "./context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function GenerateMetadata(): Promise<Metadata> {
  const NextUrl = (await headers()).get("next-url") || "";

  let Description = "zstio-tv: Platforma multimedialna radiowęzła ZSTiO.";

  if (NextUrl.includes("vote")) {
    Description = "Zagłosuj na swoją ulubioną piosenkę i wpłyń na playlistę radiowęzła ZSTiO!";
  }

  return {
    title: "zstio-tv@v2",
    description: Description,
    openGraph: {
      images: ["/metadata.jpg"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AOSInitializer />
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
