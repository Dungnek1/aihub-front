"use client";
import React, { useState, useEffect } from "react";
export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative">
      <div
        className="w-full pt-[100px] pb-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)"
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        </div>
        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-[880px] mx-auto">
          {/* Content Box with padding */}
          <div className="flex flex-col items-center gap-5 px-4">
            {/* Breadcrumb */}
            <div className="text-center">
              <p className="text-cyan-500 text-xs font-semibold tracking-wider uppercase 
                        bg-white px-4 py-2 rounded-full shadow-sm inline-block">
                Blockchain Development Partner
              </p>
            </div>
            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold text-cyan-500 text-center">
              Aihub Vietnam
            </h1>
            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-900 font-semibold text-center">
              Vận Hành & Phát Triển Các Dự Án Blockchain Chuyên Nghiệp
            </p>
            {/* Description */}
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed text-center max-w-2xl mx-auto">
              Chúng tôi cung cấp các giải pháp blockchain toàn diện và đáng tin cậy.
              Từ phát triển ứng dụng đến vận hành hệ thống, chúng tôi hỗ trợ bạn
              đạt được thành công trong lĩnh vực công nghệ blockchain.
            </p>
            {/* CTA Buttons */}
            <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center mt-4 w-full">
              <button className="px-4 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/40 hover:brightness-105 transition-all duration-300 transform hover:-translate-y-1 flex-1 sm:flex-none">
                Khám phá ngay
              </button>
              <button className="px-4 py-2 sm:px-8 sm:py-3 border-2 border-gray-300 text-gray-700 text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 flex-1 sm:flex-none">
                Tìm hiểu thêm
              </button>
            </div>
          </div>

          {/* Slider - Mobile: with padding, Desktop: original design */}
          <div className="relative w-full flex justify-center mb-8 sm:mb-12 lg:mb-20 mt-8 px-4 sm:px-0">
            <div className="w-full h-[200px] sm:h-[274px] sm:max-w-[1000px] overflow-hidden rounded-lg border border-gray-200 sm:m-8 bg-white">
              <div
                className="flex transition-transform duration-1000 ease-in-out w-full h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Slide 1 */}
                <div className="min-w-full h-full relative">
                  <img
                    src="/Banner.png"
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Slide 2 */}
                <div className="min-w-full h-full relative">
                  <video
                    src="/animation.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rectangle Section - Full Width at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-[50px] z-10">
          <img
            src="/Rectangle.png"
            alt="Rectangle"
            className="w-full h-full object-cover"
          />
        </div>
      </div>


      {/* Animated Chevron Down - positioned absolute relative to container */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 z-20 w-16 h-12 sm:w-20 sm:h-14 lg:w-[113.65px] lg:h-20"
        style={{
          bottom: '10px',
        }}
      >
        <img
          src="/chevron-down.png"
          alt="Scroll down"
          className="w-full h-full object-contain drop-shadow-lg animate-bounce"
        />
      </div>
    </div>
  );
}