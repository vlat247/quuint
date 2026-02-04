"use client";

export function AuroraBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-screen overflow-hidden"
      aria-hidden="true"
      style={{
        maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 90%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 90%)",
      }}
    >
      <div className="aurora-layer-1" />
      <div className="aurora-layer-2" />

      <style jsx>{`
        .aurora-layer-1 {
          position: absolute;
          inset: -10%;
          filter: blur(60px);
          opacity: 0.8;
          background:
            radial-gradient(ellipse 50% 40% at 20% 20%, rgba(160,160,160,0.4) 0%, transparent 70%),
            radial-gradient(ellipse 60% 35% at 75% 25%, rgba(150,150,150,0.35) 0%, transparent 65%);
          animation: drift1 8s ease-in-out infinite;
          will-change: transform;
        }
        
        .aurora-layer-2 {
          position: absolute;
          inset: -10%;
          filter: blur(80px);
          opacity: 0.7;
          background:
            radial-gradient(ellipse 55% 45% at 40% 30%, rgba(140,140,140,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 45% 50% at 80% 15%, rgba(155,155,155,0.3) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 15% 35%, rgba(145,145,145,0.32) 0%, transparent 68%);
          animation: drift2 12s ease-in-out infinite;
          animation-delay: -3s;
          will-change: transform;
        }

        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(40px, 30px); }
        }
        
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-40px, 25px); }
        }
      `}</style>
    </div>
  );
}
