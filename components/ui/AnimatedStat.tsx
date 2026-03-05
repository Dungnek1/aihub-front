"use client";

import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";

interface AnimatedStatProps {
  number: number;
  label: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedStat({
  number,
  label,
  suffix = "",
  duration = 2.5,
  className = "",
}: AnimatedStatProps) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`group flex flex-col items-center sm:items-end h-auto sm:h-[110px] w-full sm:w-[143px] transition-all duration-300 hover:scale-110 hover:-translate-y-2 cursor-pointer ${className}`}
    >
      <p className="bg-clip-text bg-gradient-to-b from-[#9ff3df] to-[#17eff7] text-transparent font-bold text-[48px] sm:text-[56px] lg:text-[72px] leading-[60px] sm:leading-[70px] lg:leading-[90px] tracking-[-1.44px] transition-all duration-300 group-hover:drop-shadow-[0_0_25px_rgba(159,243,223,0.7)] group-hover:scale-110">
        {inView && (
          <>
            <CountUp end={number} duration={duration} />
            {suffix}
          </>
        )}
        {!inView && "0"}
      </p>
      <p className="font-medium text-base sm:text-lg leading-6 sm:leading-7 text-white text-center sm:text-right transition-all duration-300 group-hover:text-cyan-300 group-hover:-translate-y-1">
        {label}
      </p>
    </div>
  );
}

