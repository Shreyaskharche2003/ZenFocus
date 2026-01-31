import { Metadata } from "next";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
    title: "Analytics - ZenFocus",
    description: "View your focus patterns, productivity trends, and AI-generated insights",
};

export default function AnalyticsPage() {
    return <Analytics />;
}
