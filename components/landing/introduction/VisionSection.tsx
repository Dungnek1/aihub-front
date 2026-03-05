export default function VisionSection() {
    return (
        <div className="w-full relative overflow-hidden py-8 md:py-12 lg:py-16">
            {/* Centered Container */}
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[100px]">
                {/* Content Wrapper */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
                    {/* Left Side - Text Content - Vertically Centered */}
                    <div className="flex-1 flex flex-col justify-center w-full">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                            Tầm Nhìn
                        </h2>

                        <div className="space-y-4 text-gray-700 text-sm md:text-base">
                            <p className="leading-relaxed">
                                Trở thành đơn vị đầu trong trong việc kết tạo hệ sinh thái{" "}
                                <span className="font-semibold">Blockchain Việt Nam</span>, nơi doanh nghiệp và cộng
                                đồng có thể xây dựng và sử dụng những công cụ <span className="font-semibold">Web3</span> và các nền tảng tài chính ứng
                                dụng trong các lĩnh vực <span className="font-semibold">Minh Bạch, An Toàn và Hiệu Quả</span>.
                            </p>

                            <p className="leading-relaxed">
                                <span className="font-semibold">Aihub Việt Nam</span> hướng đến mục tiêu tạo ra những công nghệ giúp tăng tốc sự chuyển đổi số và mở ra những cơ hội kinh tế mới cho mọi tổ chức
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Image Container - Visible on all screens */}
                    <div
                        className="rounded-2xl items-center justify-center flex-shrink-0 w-full max-w-[588px] relative overflow-hidden flex"
                        style={{
                            width: "100%",
                            height: "auto",
                            aspectRatio: "588/420",
                            borderRadius: "16px",
                            borderTop: "1px solid #E5E7EB",
                            padding: "24px",
                            background: "linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)",
                            boxShadow: "0px 1px 2px -1px #0000001A, 0px 1px 3px 0px #0000001A"
                        }}
                    >
                        {/* Image Composition - Centered */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="relative w-full" style={{ aspectRatio: "540/372" }}>
                                {/* pic1.png - Lowest z-index, rotated -10.36deg */}
                                <img
                                    src="/pic1.png"
                                    alt="pic1"
                                    className="absolute"
                                    style={{
                                        width: "42.2%",
                                        height: "auto",
                                        top: "0%",
                                        left: "35.13%",
                                        transform: "rotate(-10.36deg)",
                                        opacity: 1,
                                        zIndex: 1
                                    }}
                                />

                                {/* pic2.png - Medium z-index, rotated 11.37deg */}
                                <img
                                    src="/pic2.png"
                                    alt="pic2"
                                    className="absolute"
                                    style={{
                                        width: "42.37%",
                                        height: "auto",
                                        top: "38.98%",
                                        left: "1.48%",
                                        transform: "rotate(11.37deg)",
                                        opacity: 1,
                                        zIndex: 2
                                    }}
                                />

                                {/* pic3.png - Medium z-index, rotated -10.11deg */}
                                <img
                                    src="/pic3.png"
                                    alt="pic3"
                                    className="absolute"
                                    style={{
                                        width: "40.94%",
                                        height: "auto",
                                        top: "46.24%",
                                        left: "54.23%",
                                        transform: "rotate(-10.11deg)",
                                        opacity: 1,
                                        zIndex: 2
                                    }}
                                />

                                {/* Round-logo.png - Highest z-index, centered */}
                                <img
                                    src="/Round-logo.png"
                                    alt="Round Logo"
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    style={{
                                        width: "33.3%",
                                        height: "auto",
                                        opacity: 1,
                                        zIndex: 3
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}