import type { Metadata } from "next";
import { AppShell } from "@/components/navigation/AppShell";

export const metadata: Metadata = { title: "App demo", robots: { index: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
