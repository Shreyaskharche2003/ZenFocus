import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import Navigation from "@/components/Navigation";
import AppWrapper from "@/components/AppWrapper";
import { Analytics } from "@vercel/analytics/next";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZenFocus - AI-Powered Focus & Productivity Tracker",
  description: "Achieve deep focus with AI-powered attention tracking. ZenFocus uses computer vision to help you stay focused while respecting your privacy. All processing happens locally.",
  keywords: ["focus tracker", "productivity", "AI", "attention monitoring", "study", "pomodoro"],
  authors: [{ name: "ZenFocus Team" }],
  openGraph: {
    title: "ZenFocus - AI-Powered Focus & Productivity Tracker",
    description: "Achieve deep focus with AI-powered attention tracking.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable}`}>
        <AuthProvider>
          <AppWrapper>
            <Navigation />
            <main>{children}</main>
            <Analytics />
          </AppWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
