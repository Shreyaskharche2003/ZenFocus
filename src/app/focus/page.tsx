import { Metadata } from "next";
import FocusSession from "@/components/FocusSession";

export const metadata: Metadata = {
    title: "Focus Mode - ZenFocus",
    description: "Start a focus session with AI-powered attention tracking",
};

export default function FocusPage() {
    return <FocusSession />;
}
