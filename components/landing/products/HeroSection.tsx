"use client";
export default function HeroSection() {
    return (
        <div className="relative w-full flex justify-center bg-white">
            <div
                className="relative overflow-hidden flex flex-col lg:block"
                style={{
                    width: "100%",
                    minHeight: "727px",
                    background: "linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)"
                }}
            >
                {/* Main Content Container */}
                <div className="relative z-10 w-full h-full flex items-center justify-center py-20 lg:py-0">
                    <div className="relative w-full max-w-[1400px]">
                        {/* Desktop Layout */}
                        <div className="hidden lg:block relative" style={{ height: "727px" }}>
                            {/* Left Content Box */}
                            <div className="flex flex-col gap-6 w-full max-w-[511px] flex-shrink-0 absolute left-[100px] top-1/2 transform -translate-y-1/2 z-20">
                                {/* Title Box */}
                                <div
                                    className="bg-white rounded-[20px] flex flex-col items-center justify-center border-2 border-cyan-400"
                                    style={{
                                        width: "100%",
                                        height: "134px",
                                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)"
                                    }}
                                >
                                    <p className="text-xl font-bold text-gray-900 mb-2">
                                        Sản Phẩm & Gói Dịch Vụ
                                    </p>
                                    <img src="/Aihub-vn.png" alt="AI HUB VIETNAM" className="h-12 w-auto object-contain" />
                                </div>

                                {/* Description & Buttons Box */}
                                <div
                                    className="bg-white/60 backdrop-blur-sm rounded-[20px] p-6 flex flex-col mx-auto"
                                    style={{
                                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                        width: "80%",
                                    }}
                                >
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Dưới đây là các mô tả ngắn gọn, nhấn mạnh lợi ích cụ thể của từng gói dịch vụ: Chia làm 3 cấp độ giá:
                                    </p>
                                    <div className="flex gap-2 mt-6">
                                        <button className="w-36 h-10 px-5 py-2 rounded-lg border border-gray-300 bg-gradient-to-b from-gray-100 to-cyan-100 text-xs font-semibold text-cyan-700 hover:opacity-80 transition">
                                            Demo Referral
                                        </button>
                                        <button className="w-16 h-10 px-5 py-2 rounded-lg border border-white border-opacity-50 bg-gradient-to-b from-cyan-400 to-cyan-300 text-xs font-semibold text-white hover:opacity-80 transition">
                                            Pro
                                        </button>
                                        <button className="w-28 h-10 px-5 py-2 rounded-lg border border-white border-opacity-50 bg-gradient-to-b from-purple-300 to-purple-100 text-xs font-semibold text-purple-900 hover:opacity-80 transition">
                                            Business
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Mask Group - Background layer */}
                            <img
                                src="/Mask group-1.png"
                                alt="Mask Group Background"
                                className="absolute pointer-events-none z-0"
                                style={{
                                    width: "100%",
                                    height: "auto",
                                    top: "50%",
                                    left: "60%",
                                    transform: "translate(-50%, -50%)",
                                    opacity: 1,
                                }}
                            />

                            {/* Right Column - Cubes Container */}
                            <div className="absolute w-[600px] h-[727px] pointer-events-none flex-shrink-0 right-[100px] top-0 z-10">
                                {/* Gray Cube - Bottom Left */}
                                <div
                                    className="absolute"
                                    style={{
                                        width: "220px",
                                        height: "225px",
                                        top: "296px",
                                        left: "40px"
                                    }}
                                >
                                    <img
                                        src="/gray-cube.png"
                                        alt="Gray Cube"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Blue Cube - Middle */}
                                <div
                                    className="absolute"
                                    style={{
                                        width: "260px",
                                        height: "266px",
                                        top: "182px",
                                        left: "181px"
                                    }}
                                >
                                    <img
                                        src="/blue-cube.png"
                                        alt="Blue Cube"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Purple Cube - Right */}
                                <div
                                    className="absolute"
                                    style={{
                                        width: "384px",
                                        height: "392px",
                                        top: "198px",
                                        left: "311px"
                                    }}
                                >
                                    <img
                                        src="/purple-cube.png"
                                        alt="Purple Cube"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Layout (< 640px) */}
                        <div className="sm:hidden relative flex flex-col items-center justify-start pt-8 px-4 gap-2 min-h-[500px]">
                            {/* Mask Group - Background layer for entire mobile section */}
                            <img
                                src="/Mask group-1.png"
                                alt="Mask Group Background"
                                className="absolute pointer-events-none"
                                style={{
                                    width: "200%",
                                    height: "auto",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    opacity: 1,
                                    zIndex: 0,
                                }}
                            />

                            {/* Title Box */}
                            <div
                                className="bg-white rounded-[20px] flex flex-col items-center justify-center border-2 border-cyan-400 w-full max-w-[400px] relative z-10"
                                style={{
                                    height: "134px",
                                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)"
                                }}
                            >
                                <p className="text-xl font-bold text-gray-900 mb-2">
                                    Sản Phẩm & Gói Dịch Vụ
                                </p>
                                <img src="/Aihub-vn.png" alt="AI HUB VIETNAM" className="h-12 w-[90%] object-contain" />
                            </div>

                            {/* Description & Buttons Box */}
                            <div
                                className="bg-white/60 backdrop-blur-sm rounded-[20px] p-2 sm:p-6 flex flex-col gap-4 w-full max-w-[400px] relative z-10"
                                style={{
                                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                }}
                            >
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Dưới đây là các mô tả ngắn gọn, nhấn mạnh lợi ích cụ thể của từng gói dịch vụ: Chia làm 3 cấp độ giá:
                                </p>
                                <div className="flex gap-1 sm:gap-3 flex-wrap">
                                    <button className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all">
                                        Demo Referral
                                    </button>
                                    <button className="px-5 py-2.5 bg-cyan-400 text-white text-sm font-medium rounded-lg hover:bg-cyan-500 transition-all shadow-md shadow-cyan-200">
                                        Pro
                                    </button>
                                    <button className="px-5 py-2.5 bg-purple-200 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-300 transition-all shadow-md shadow-purple-100">
                                        Business
                                    </button>
                                </div>
                            </div>

                            {/* Cubes for Mobile */}
                            <div className="relative w-full max-w-[300px] h-[250px] mt-2 z-10 mx-auto">
                                {/* Gray Cube */}
                                <div className="absolute" style={{ width: "90px", height: "92px", top: "80px", left: "20px", zIndex: 10 }}>
                                    <img src="/gray-cube.png" alt="Gray Cube" className="w-full h-full object-contain" />
                                </div>

                                {/* Blue Cube */}
                                <div className="absolute" style={{ width: "110px", height: "112px", top: "40px", left: "70px", zIndex: 10 }}>
                                    <img src="/blue-cube.png" alt="Blue Cube" className="w-full h-full object-contain" />
                                </div>

                                {/* Purple Cube */}
                                <div className="absolute" style={{ width: "160px", height: "163px", top: "50px", left: "130px", zIndex: 10 }}>
                                    <img src="/purple-cube.png" alt="Purple Cube" className="w-full h-full object-contain" />
                                </div>
                            </div>
                        </div>

                        {/* Tablet Layout (640px - 1023px) */}
                        <div className="hidden sm:block lg:hidden relative flex-col items-center justify-start pt-8 px-4 gap-2 min-h-[600px]">
                            {/* Mask Group - Background layer for entire tablet section */}
                            <img
                                src="/Mask group-1.png"
                                alt="Mask Group Background"
                                className="absolute pointer-events-none"
                                style={{
                                    width: "180%",
                                    height: "auto",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    opacity: 1,
                                    zIndex: 0,
                                }}
                            />

                            {/* Title Box */}
                            <div
                                className="bg-white rounded-[20px] flex flex-col items-center justify-center border-2 border-cyan-400 w-full max-w-[500px] mx-auto relative z-10"
                                style={{
                                    height: "134px",
                                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)"
                                }}
                            >
                                <p className="text-xl font-bold text-gray-900 mb-2">
                                    Sản Phẩm & Gói Dịch Vụ
                                </p>
                                <img src="/Aihub-vn.png" alt="AI HUB VIETNAM" className="h-12 w-auto object-contain" />
                            </div>

                            {/* Description & Buttons Box */}
                            <div
                                className="bg-white/60 backdrop-blur-sm rounded-[20px] p-6 flex flex-col gap-4 w-full max-w-[500px] mx-auto mt-2 relative z-10"
                                style={{
                                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                                }}
                            >
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Dưới đây là các mô tả ngắn gọn, nhấn mạnh lợi ích cụ thể của từng gói dịch vụ: Chia làm 3 cấp độ giá:
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    <button className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all">
                                        Demo Referral
                                    </button>
                                    <button className="px-5 py-2.5 bg-cyan-400 text-white text-sm font-medium rounded-lg hover:bg-cyan-500 transition-all shadow-md shadow-cyan-200">
                                        Pro
                                    </button>
                                    <button className="px-5 py-2.5 bg-purple-200 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-300 transition-all shadow-md shadow-purple-100">
                                        Business
                                    </button>
                                </div>
                            </div>

                            {/* Cubes for Tablet - Larger */}
                            <div className="relative w-full max-w-[600px] h-[400px] mx-auto mt-2 z-10">
                                {/* Gray Cube - Larger for tablet */}
                                <div className="absolute" style={{ width: "200px", height: "205px", top: "100px", left: "20px", zIndex: 10 }}>
                                    <img src="/gray-cube.png" alt="Gray Cube" className="w-full h-full object-contain" />
                                </div>

                                {/* Blue Cube - Larger for tablet */}
                                <div className="absolute" style={{ width: "240px", height: "245px", top: "40px", left: "140px", zIndex: 10 }}>
                                    <img src="/blue-cube.png" alt="Blue Cube" className="w-full h-full object-contain" />
                                </div>

                                {/* Purple Cube - Larger for tablet */}
                                <div className="absolute" style={{ width: "340px", height: "347px", top: "50px", left: "280px", zIndex: 10 }}>
                                    <img src="/purple-cube.png" alt="Purple Cube" className="w-full h-full object-contain" />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Bottom Rectangle Section */}
                <div className="absolute bottom-0 left-0 w-full h-[50px] z-10">
                    <img
                        src="/Rectangle.png"
                        alt="Rectangle"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Animated Chevron Down */}
                <div
                    className="absolute left-1/2 transform -translate-x-1/2 z-20"
                    style={{
                        width: '113.65px',
                        height: '80px',
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
        </div>
    );
}