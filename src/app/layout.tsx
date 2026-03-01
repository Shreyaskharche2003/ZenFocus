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
  description: "Achieve deep focus with ZenFocus's AI-powered attention tracking. It evaluates your study patterns using local computer vision to help you reduce distractions and stay productive. 100% private.",
  keywords: [
    "AI focus tracker",
    "productivity app",
    "study timer",
    "attention monitoring",
    "distraction blocker",
    "pomodoro timer",
    "deep work tool",
    "remote study room",
    "private AI computer vision",
    "ZenFocus"
  ],
  authors: [{ name: "ZenFocus Team" }],
  openGraph: {
    title: "ZenFocus - AI-Powered Focus & Productivity Tracker",
    description: "Stay focused longer using AI computer vision. ZenFocus analyzes your attention in real-time, privately, without sending video to the cloud.",
    type: "website",
    url: "https://zenfocus.vercel.app",
    siteName: "ZenFocus",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenFocus - Stay Productive with AI",
    description: "Reduce distractions and improve your study sessions using AI. Try ZenFocus today.",
  },
  verification: {
    google: "rwjYlurAMxdlF5M-DcZ8q69p2eM81R6WhkzUVidDTcE"
  }
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
