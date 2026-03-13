import Navbar from "@/components/landing-page/Navbar";
import Hero from "@/components/landing-page/Hero";
import DualMode from "@/components/landing-page/DualMode";
import Tones from "@/components/landing-page/Tones";
import ChatBlocking from "@/components/landing-page/ChatBlocking";
import KnowledgeBase from "@/components/landing-page/KnowledgeBase";
import MultiGateway from "@/components/landing-page/MultiGateway";
import ProModeTiming from "@/components/landing-page/ProModeTiming";
import SessionSecurity from "@/components/landing-page/SessionSecurity";
import Architecture from "@/components/landing-page/Architecture";
import CTASection from "@/components/landing-page/CTASection";
import Footer from "@/components/landing-page/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 selection:bg-brand-accent-blue/20 font-inter scroll-smooth">
      <Navbar />
      <Hero />
      <DualMode />
      <Tones />
      <ChatBlocking />
      <KnowledgeBase />
      <MultiGateway />
      <ProModeTiming />
      <SessionSecurity />
      <Architecture />
      <CTASection />
      <Footer />
    </main>
  );
}
