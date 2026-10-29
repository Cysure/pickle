import { MarketingNav } from "@/components/navigation/MarketingNav";
import { Footer } from "@/components/navigation/Footer";
import { Toaster } from "@/components/ui";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-pickle focus:px-4 focus:py-2 focus:font-semibold">Skip to content</a>
      <MarketingNav />
      <main id="main">{children}</main>
      <Footer />
      <Toaster />
    </>
  );
}
