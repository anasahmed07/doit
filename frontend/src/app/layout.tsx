import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://doit-by-anas.vercel.app"),
  title: {
    default: "DOIT - Modern Task & Project Management",
    template: "%s | DOIT"
  },
  description: "The modern way to organize your tasks & projects with multimedia support, Kanban workflows, and a unified workspace.",
  keywords: ["task management", "project management", "kanban", "multimedia notes", "unified workspace", "productivity", "better-auth"],
  authors: [{ name: "Anas Shaikh" }],
  creator: "Anas Shaikh",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doit-by-anas.vercel.app",
    siteName: "DOIT",
    title: "DOIT - Modern Task & Project Management",
    description: "The modern way to organize your tasks & projects with multimedia support, Kanban workflows, and a unified workspace.",
    images: [
      {
        url: "/images/doit frontend.png",
        width: 1200,
        height: 630,
        alt: "DOIT Dashboard Screenshot"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "DOIT - Modern Task & Project Management",
    description: "The modern way to organize your tasks & projects with multimedia support, Kanban workflows, and a unified workspace.",
    images: ["/images/doit frontend.png"],
    creator: "@anas_shaikh"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    title: "DOIT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
