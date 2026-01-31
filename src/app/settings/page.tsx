import { Metadata } from "next";
import Settings from "@/components/Settings";

export const metadata: Metadata = {
    title: "Settings - ZenFocus",
    description: "Customize your ZenFocus experience",
};

export default function SettingsPage() {
    return <Settings />;
}
