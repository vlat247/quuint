"use client";

import { X, Check, Sparkles } from "lucide-react";

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlansModal({ isOpen, onClose }: PlansModalProps) {
  if (!isOpen) return null;

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for testing the waters.",
      features: [
        "1 Knowledge Base",
        "3 Sources per KB",
        "5 Scans per day",
        "Standard AI summaries",
      ],
      buttonText: "Current Plan",
      featured: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/mo",
      description: "For serious knowledge builders.",
      features: [
        "Unlimited Knowledge Bases",
        "Unlimited Sources",
        "Unlimited Scans",
        "Priority AI (GPT-4o/Claude 3.5)",
        "Automated Weekly Digests",
        "Semantic Search inside KBs",
      ],
      buttonText: "Upgrade to Pro",
      featured: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white/95 backdrop-blur-3xl animate-in slide-in-from-bottom duration-500 ease-out">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex-none px-6 pt-12 pb-6 flex justify-between items-center border-b border-zinc-100/50 sticky top-0 bg-white/20 backdrop-blur-xl z-10">
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Select Plan</h2>
        <button 
          onClick={onClose}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-100/80 text-zinc-500 hover:bg-zinc-200 active:scale-90 transition-all border border-zinc-200/50"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 pb-16">
        <div className="text-center space-y-3 mb-10">
          <p className="text-indigo-600 font-extrabold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 fill-current animate-pulse" />
            Vibrant Special Offer
          </p>
          <h3 className="text-4xl font-black text-zinc-900 leading-[1.1]">Elevate your productivity</h3>
          <p className="text-zinc-500 max-w-[280px] mx-auto text-[15px] font-medium leading-relaxed">Join thousands of high-performers using our AI knowledge system.</p>
        </div>

        <div className="space-y-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative overflow-hidden p-8 rounded-[36px] border transition-all duration-300 ${
                plan.featured 
                  ? "border-transparent bg-white shadow-[0_20px_50px_rgba(79,70,229,0.15)] scale-[1.02]" 
                  : "border-zinc-100 bg-zinc-50/50"
              }`}
            >
              {plan.featured && (
                <>
                  {/* Pro Plan Gradient Background */}
                  <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-[1] -z-10" />
                  {/* Subtle Grainy Overlay */}
                   <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-10" />
                  
                  <div className="absolute top-4 right-6 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                    Most Popular
                  </div>
                </>
              )}

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className={`text-2xl font-black tracking-tight ${plan.featured ? "text-white" : "text-zinc-900"}`}>{plan.name}</h4>
                  <p className={`text-sm mt-1.5 font-medium ${plan.featured ? "text-white/70" : "text-zinc-500"}`}>{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end">
                    <span className={`text-4xl font-black tracking-tighter ${plan.featured ? "text-white" : "text-zinc-900"}`}>{plan.price}</span>
                    <span className={`text-sm font-bold ml-1 ${plan.featured ? "text-white/60" : "text-zinc-400"}`}>{plan.period}</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-start gap-4 text-[15px] font-medium leading-normal ${plan.featured ? "text-white/90" : "text-zinc-600"}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-none mt-0.5 ${plan.featured ? "bg-white text-indigo-600 shadow-lg" : "bg-zinc-200 text-zinc-500"}`}>
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={!plan.featured}
                className={`w-full py-5 rounded-[22px] font-black text-[17px] tracking-tight transition-all active:scale-[0.97] shadow-xl ${
                  plan.featured
                    ? "bg-white text-indigo-600 hover:shadow-2xl hover:shadow-white/20"
                    : "bg-zinc-200 text-zinc-400 cursor-default"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="pt-6 pb-4">
           <p className="text-center text-zinc-400 text-xs font-semibold uppercase tracking-widest opacity-60">
             Trusted by elite researchers worldwide
           </p>
        </div>
      </div>
    </div>
  );
}
