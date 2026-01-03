import { createFileRoute } from '@tanstack/react-router';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Pricing } from '../components/Pricing';
import { ChatWithAI } from '../components/ChatWithAI';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <ChatWithAI />
    </>
  );
}
