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
      <div className="aurora-layer-3" />

      <style jsx>{`
        .aurora-layer-1 {
          position: absolute;
          inset: -20%;
          filter: blur(80px);
          opacity: 0.95;
          background:
            radial-gradient(ellipse 45% 35% at 12% 15%, rgba(160,160,160,0.45) 0%, transparent 70%),
            radial-gradient(ellipse 55% 40% at 78% 22%, rgba(150,150,150,0.42) 0%, transparent 65%),
            radial-gradient(ellipse 35% 50% at 35% 8%, rgba(170,170,170,0.40) 0%, transparent 60%),
            radial-gradient(ellipse 60% 30% at 92% 35%, rgba(145,145,145,0.40) 0%, transparent 70%),
            radial-gradient(ellipse 40% 45% at 58% 18%, rgba(155,155,155,0.38) 0%, transparent 65%);
          animation: drift1 5s ease-in-out infinite;
        }
        
        .aurora-layer-2 {
          position: absolute;
          inset: -15%;
          filter: blur(100px);
          opacity: 0.9;
          background:
            radial-gradient(ellipse 50% 40% at 25% 28%, rgba(140,140,140,0.45) 0%, transparent 70%),
            radial-gradient(ellipse 70% 35% at 63% 12%, rgba(165,165,165,0.38) 0%, transparent 65%),
            radial-gradient(ellipse 45% 55% at 88% 20%, rgba(135,135,135,0.42) 0%, transparent 60%),
            radial-gradient(ellipse 55% 30% at 8% 35%, rgba(155,155,155,0.36) 0%, transparent 70%),
            radial-gradient(ellipse 38% 42% at 45% 25%, rgba(148,148,148,0.40) 0%, transparent 65%);
          animation: drift2 8s ease-in-out infinite;
          animation-delay: -2s;
        }
        
        .aurora-layer-3 {
          position: absolute;
          inset: -25%;
          filter: blur(120px);
          opacity: 0.85;
          background:
            radial-gradient(ellipse 65% 45% at 18% 20%, rgba(130,130,130,0.40) 0%, transparent 75%),
            radial-gradient(ellipse 40% 50% at 72% 30%, rgba(142,142,142,0.38) 0%, transparent 65%),
            radial-gradient(ellipse 55% 35% at 40% 15%, rgba(158,158,158,0.35) 0%, transparent 70%);
          animation: drift3 10s ease-in-out infinite;
          animation-delay: -4s;
        }

        @keyframes drift1 {
          0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
          15% { transform: translateX(80px) translateY(30px) rotate(1.5deg); }
          35% { transform: translateX(-50px) translateY(60px) rotate(-1deg); }
          55% { transform: translateX(100px) translateY(-20px) rotate(0.8deg); }
          75% { transform: translateX(-30px) translateY(40px) rotate(-0.5deg); }
        }
        
        @keyframes drift2 {
          0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
          20% { transform: translateX(-90px) translateY(45px) rotate(-1.8deg); }
          45% { transform: translateX(70px) translateY(-30px) rotate(1.2deg); }
          70% { transform: translateX(-40px) translateY(55px) rotate(-0.6deg); }
        }
        
        @keyframes drift3 {
          0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
          18% { transform: translateX(55px) translateY(50px) rotate(1.2deg); }
          36% { transform: translateX(-45px) translateY(25px) rotate(-0.8deg); }
          54% { transform: translateX(-75px) translateY(-15px) rotate(1.5deg); }
          72% { transform: translateX(45px) translateY(40px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
}
