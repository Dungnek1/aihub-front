export default function CTASection() {
    return (
        <div
            className="w-full"
            style={{
                background: "linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)",
                boxShadow: "inset 0px 10px 20px rgba(0,0,0,0.1), inset 0px -10px 20px rgba(0,0,0,0.1)",
            }}
        >
            {/* Main Container */}
            <div className="relative flex justify-center items-center max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[120px] py-10 sm:py-16 lg:py-[80px]">

                {/* Ảnh 1: Ẩn trên mobile, hiển thị từ tablet trở lên
                    Trên tablet: đặt ở bottom, trên desktop: đặt ở center
                */}
                <div className="hidden sm:block absolute sm:left-[-10px] lg:left-15 sm:bottom-[-10px] lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2">
                    <img src="/Cta1.png" alt="Cta 1" className="w-auto h-auto object-contain sm:w-50 sm:h-50 lg:w-auto lg:h-auto" />
                </div>

                {/* Khối Nội dung Chính (Nền Trắng) */}
                <div className="w-full lg:w-[990px] h-auto lg:h-[248px] bg-white rounded-[20px] p-6 sm:p-10 lg:p-[40px] flex flex-col justify-center items-center gap-4 lg:gap-[20px] shadow-lg mx-auto">
                    {/* Heading */}
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center w-full">
                        Xây dựng tương lai số. Một dòng mã tại một thời điểm.
                    </h2>
                    {/* Subtext */}
                    <p className="text-sm sm:text-base text-gray-600 max-w-xl text-center mx-auto">
                        Aihub Vietnam mang đến một lược tiếp cận nhanh, tinh gọn và tối ưu, được thiết kế để đi xa và dễ thích ứng cho các tệp dự án của bạn.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center w-full">
                        <button className="px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-all duration-300">
                            Start Building
                        </button>
                        <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300">
                            Talk to an Expert
                        </button>
                    </div>
                </div>

                {/* Ảnh 2: Ẩn trên mobile, hiển thị từ tablet trở lên
                    Trên tablet: đặt ở bottom, trên desktop: đặt ở center
                */}
                <div className="hidden sm:block absolute sm:right-[-10px] lg:right-[40px] sm:bottom-[-10px] lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2">
                    <img src="/Cta2.png" alt="Cta 2" className="w-auto h-auto object-contain sm:w-50 sm:h-50 lg:w-auto lg:h-auto" />
                </div>
            </div>
        </div>
    );
}