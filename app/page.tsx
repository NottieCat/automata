import { auth } from "@clerk/nextjs/server";
import CanvasPreview from "@/components/landing/CanvasPreview";
import Cta from "@/components/landing/Cta";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar isSignedIn={!!userId} />
      <main>
        <Hero />
        <CanvasPreview />
        <FeaturesGrid />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
