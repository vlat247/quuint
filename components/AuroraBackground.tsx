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
          filter: blur(80px);
          opacity: 0.4;
          background:
            radial-gradient(ellipse 50% 40% at 20% 20%, rgba(120,119,198,0.3) 0%, transparent 70%),
            radial-gradient(ellipse 60% 35% at 75% 25%, rgba(100,100,111,0.2) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 50% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 60%);
          animation: drift1 18s ease-in-out infinite alternate;
          will-change: transform;
        }
        
        .aurora-layer-2 {
          position: absolute;
          inset: -10%;
          filter: blur(90px);
          opacity: 0.3;
          background:
            radial-gradient(ellipse 55% 45% at 40% 30%, rgba(167, 139, 250, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 45% 50% at 80% 15%, rgba(14, 165, 233, 0.15) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 15% 35%, rgba(200,200,200,0.1) 0%, transparent 68%);
          animation: drift2 22s ease-in-out infinite alternate;
          animation-delay: -5s;
          will-change: transform;
        }

        @keyframes drift1 {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(30px, 20px) rotate(2deg); }
          100% { transform: translate(-20px, 40px) rotate(-1deg); }
        }
        
        @keyframes drift2 {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-30px, 15px) rotate(-2deg); }
          100% { transform: translate(20px, -30px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}
