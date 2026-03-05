"use client";
export default function BackgroundCubes() {
  return (
    <div className="absolute top-0 w-full max-w-[500px] h-auto aspect-[500/596] sm:w-[500px] sm:h-[596px] rounded-[32px] bg-[linear-gradient(180deg,#99AED5_0%,#FFFFFF_100%)]" style={{ overflow: 'hidden' }}>
      {/* Cube 1 - Top Right */}
      <img
        src="/cube.png"
        alt="Cube top right"
        className="absolute"
        style={{
          top: '-120px',
          right: '-150px',
          transform: 'rotate(0deg)',
          opacity: 0.3,
          mixBlendMode: 'overlay',
          filter: 'brightness(1.1) saturate(0.8)',
        }}
      />
      {/* Cube 2 - Bottom Left */}
      <img
        src="/cube.png"
        alt="Cube bottom left"
        className="absolute"
        style={{
          bottom: '-10px',
          left: '-150px',
          transform: 'rotate(0deg)',
          opacity: 0.3,
          mixBlendMode: 'overlay',
          filter: 'brightness(1.1) saturate(0.8)',
        }}
      />

      {/* Pic 3 */}
      <img
        src="/pic3.png"
        alt="Pic 3"
        className="absolute animate-pic3"
        style={{
          width: '273.6888732910156px',
          height: '229.73492431640625px',
          top: '279.88px',
          left: '214px',
          opacity: 1,
          zIndex: 3,
        }}
      />

      {/* Pic 2 */}
      <img
        src="/pic2.png"
        alt="Pic 2"
        className="absolute animate-pic2"
        style={{
          width: '282.5713806152344px',
          height: '236.61648559570312px',
          top: '247.27px',
          left: '10px',
          opacity: 1,
          zIndex: 2,
        }}
      />

      {/* Pic 1 */}
      <img
        src="/pic1.png"
        alt="Pic 1"
        className="absolute animate-pic1"
        style={{
          width: '278.5713806152344px',
          height: '233.26699829101562px',
          top: '218px',
          left: '192px',
          opacity: 1,
          zIndex: 1,
        }}
      />

      <style>{`
  @keyframes slidePic3 {
    from { transform: translate(0, 0) rotate(0deg); opacity: 0; }
    to   { transform: translate(-10px, -104.88px) rotate(10.11deg); opacity: 1; }
  }

  @keyframes slidePic2 {
    from { transform: translate(0, 0) rotate(0deg); opacity: 0; }
    to   { transform: translate(10px, -178.27px) rotate(-11.37deg); opacity: 1; }
  }

  @keyframes slidePic1 {
    from { transform: translate(0, 0) rotate(0deg); opacity: 0; }
    to   { transform: translate(10px, -190px) rotate(10.36deg); opacity: 1; }
  }

  .animate-pic3 { animation: slidePic3 0.8s ease-out forwards; }
  .animate-pic2 { animation: slidePic2 0.8s ease-out forwards; animation-delay: 0.1s; }
  .animate-pic1 { animation: slidePic1 0.8s ease-out forwards; animation-delay: 0.2s; }

  /* Mobile: dịch Pic 1 & Pic 3 sang trái */
  @media (max-width: 640px) {
    img.animate-pic3 {
      left: 150px !important; /* dịch trái 64px so với desktop */
      width: 250px !important; /* co nhỏ cho mobile nếu muốn */
      height: 200px !important;
    }
    img.animate-pic1 {
      left: 120px !important; /* dịch trái 72px */
      width: 250px !important;
      height: 200px !important;
    }
    img.animate-pic2 {
      width: 250px !important; /* co nhỏ nhưng không đổi left */
      height: 200px !important;
    }
  }
`}</style>

    </div>
  );
}