/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import '../styles/globals.css';

// Structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "OlanAI",
  "description": "AI-powered software delivery with engineering discipline. We build SaaS products, mobile apps, and internal tools.",
  "url": "https://olanai.tech",
  "logo": "https://olanai.tech/logo.png",
  "email": "hello@olanai.tech",
  "priceRange": "$5,000 - $50,000",
  "areaServed": "Worldwide",
  "serviceType": ["Software Development", "AI Engineering", "Digital Transformation", "Mobile App Development", "SaaS Development"],
  "sameAs": ["https://github.com/olanai"],
  "offers": {
    "@type": "Offer",
    "description": "Milestone-based software development projects",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "price": "5000",
      "priceCurrency": "USD",
      "minPrice": "5000"
    }
  }
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'OlanAI - AI Engineering, with foresight' },
      { name: 'title', content: 'OlanAI - AI Engineering, with foresight' },
      { name: 'description', content: 'AI-powered software delivery with engineering discipline. We build from scratch or extend what you have — SaaS, mobile apps, internal tools. Milestone-based pricing, real engineers, no chaos.' },
      { name: 'keywords', content: 'AI engineering, software development, SaaS development, mobile app development, internal tools, digital transformation, AI-powered development, software agency' },
      { name: 'author', content: 'OlanAI' },
      { name: 'robots', content: 'index, follow' },
      { name: 'theme-color', content: '#7c3aed' },
      { name: 'msapplication-TileColor', content: '#7c3aed' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://olanai.tech' },
      { property: 'og:title', content: 'OlanAI - AI Engineering, with foresight' },
      { property: 'og:description', content: 'AI-powered software delivery with engineering discipline. We build from scratch or extend what you have — SaaS, mobile apps, internal tools. Milestone-based pricing, real engineers, no chaos.' },
      { property: 'og:image', content: 'https://olanai.tech/og-image.png' },
      { property: 'og:site_name', content: 'OlanAI' },
      { property: 'og:locale', content: 'en_US' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: 'https://olanai.tech' },
      { name: 'twitter:title', content: 'OlanAI - AI Engineering, with foresight' },
      { name: 'twitter:description', content: 'AI-powered software delivery with engineering discipline. We build from scratch or extend what you have — SaaS, mobile apps, internal tools.' },
      { name: 'twitter:image', content: 'https://olanai.tech/og-image.png' },
    ],
    links: [
      { rel: 'canonical', href: 'https://olanai.tech' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://www.googletagmanager.com' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(structuredData),
      },
      {
        src: 'https://www.googletagmanager.com/gtag/js?id=G-NKLS7H26GY',
        async: true,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
        {/* Background Decorative Gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[100px] rounded-full" />
        </div>

        <Navbar />

        <main className="relative z-10">
          <Outlet />
        </main>

        <Footer />
      </div>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

// Google Analytics initialization component
function GoogleAnalytics() {
  return (
    <script
      id="ga-init"
      src=""
      ref={(el) => {
        if (el && typeof window !== 'undefined') {
          // Initialize dataLayer and gtag
          (window as any).dataLayer = (window as any).dataLayer || [];
          function gtag(...args: any[]) {
            (window as any).dataLayer.push(args);
          }
          (window as any).gtag = gtag;
          gtag('js', new Date());
          gtag('config', 'G-NKLS7H26GY');
        }
      }}
    />
  );
}
