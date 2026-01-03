
import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MarqueeLogos } from './components/MarqueeLogos';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
// import { Testimonials } from './components/Testimonials';
import { ChatWithAI } from './components/ChatWithAI';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      <Navbar />

      <main className="relative z-10">
        <Hero />
        {/* <MarqueeLogos /> */}
        <Features />
        <Pricing />
        {/* <Testimonials /> */}
        <ChatWithAI />
      </main>

      <Footer />
    </div>
  );
};

export default App;
