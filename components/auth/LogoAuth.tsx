export default function LogoAuth() {
  return (
    <div className="relative h-[100px] w-[100px] mx-auto">
      {/* Vòng tròn xanh bao quanh */}
      <span className="absolute inset-0 rounded-full border-2 border-[#01D3F2]" />
      {/* Vòng tròn nền */}
      <span className="absolute inset-[16px] rounded-full bg-[#0A2330] shadow-[0_0_20px_rgba(255,255,255,0.3),0_0_40px_rgba(255,255,255,0.15)]" />
      {/* Icon ở giữa */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/frame-83.png"
        alt="AI Hub"
        className="absolute inset-0 m-auto w-8 h-8 z-1"
      />
    </div>
  );
}

