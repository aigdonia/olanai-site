
import React, { useState } from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '2,999',
    description: 'Perfect for startups needing an MVP.',
    features: ['Single AI Agent', 'Custom UI/UX', 'Landing Page', 'Basic Integration']
  },
  {
    name: 'Professional',
    price: '5,999',
    description: 'Ideal for growing businesses scaling up.',
    features: ['3 AI Agents', 'Full Web App', 'API Management', 'Priority Support', 'Cloud Deployment'],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Dedicated resources for large organizations.',
    features: ['Unlimited Agents', 'Infrastructure Audit', 'On-premise Options', '24/7 Support', 'Security Compliance']
  }
];

export const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Transparent Pricing</h2>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-7 rounded-full bg-white/10 p-1 relative flex items-center transition-colors hover:bg-white/20"
            >
              <div className={`w-5 h-5 bg-purple-500 rounded-full transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-gray-500'}`}>Annually (Save 20%)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div 
              key={i}
              className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                plan.popular 
                ? 'bg-white/5 border-purple-500/50 scale-105 shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]' 
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="text-xl font-bold mb-2">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold">{plan.price !== 'Custom' ? `$${plan.price}` : 'Custom'}</span>
                {plan.price !== 'Custom' && <span className="text-gray-500">/mo</span>}
              </div>
              <p className="text-gray-400 text-sm mb-8">{plan.description}</p>
              
              <button className={`w-full py-4 rounded-xl font-bold mb-8 transition-colors ${
                plan.popular ? 'bg-purple-500 hover:bg-purple-600' : 'bg-white/10 hover:bg-white/20'
              }`}>
                Choose {plan.name}
              </button>

              <div className="space-y-4">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-purple-500" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
