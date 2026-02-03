"use client";

/**
 * BuiltForScroller - Infinite scrolling text
 * 
 * Adjust speed: Change animation duration (currently 20s)
 * Adjust direction: Change animation name to scroll-right for reverse
 */
export function BuiltForScroller() {
  const items = [
    "Founders",
    "Marketers", 
    "Analysts",
    "Creators",
    "Students",
    "Crypto traders",
    "Researchers",
    "Knowledge workers",
  ];

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];

  return (
    <section className="relative overflow-hidden bg-zinc-50 py-16">
      {/* Title */}
      <h2 className="mb-8 text-center text-2xl font-semibold text-zinc-900">
        Built for
      </h2>

      {/* Scrolling container with fade masks */}
      <div 
        className="relative mx-auto max-w-4xl"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      >
        <div className="flex animate-scroll hover:[animation-play-state:paused]">
          {duplicatedItems.map((item, index) => (
            <span
              key={index}
              className="mx-6 shrink-0 text-4xl font-medium text-zinc-700"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </section>
  );
}
