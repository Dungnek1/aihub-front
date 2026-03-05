export default function CoreValuesSection() {
    return (
        <div className="w-full bg-white">
            {/* Main Container */}
            <div
                className="relative flex flex-col items-center mx-auto px-4 py-10 lg:px-[120px] lg:py-[64px] gap-8 lg:gap-[64px]"
                style={{
                    maxWidth: '1440px',
                }}
            >

                {/* Text Section */}
                <div className="w-full flex flex-col gap-4 lg:gap-5 items-center justify-center text-center">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                        Giá Trị Cốt Lõi
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-[800px] leading-relaxed">
                        Chúng tôi hướng tới và đồng hành cùng mọi đối tượng trong hệ sinh thái blockchain, từ cộng đồng người dùng đến các doanh nghiệp lớn.
                    </p>
                </div>

                {/* Cards Section */}
                <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-5 lg:gap-[20px]">

                    {/* Card 1: Image Top, Text Bottom */}
                    <div
                        className="flex flex-col items-center justify-between w-full lg:flex-1 h-auto lg:h-[442px] rounded-2xl border border-gray-200 border-t-gray-200 p-6 gap-4 bg-gradient-to-br from-[#ECFEFF] via-[#EFF6FF] to-[#FAF5FF] shadow-sm"
                        style={{
                            background: 'linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)',
                        }}
                    >
                        {/* Image Area */}
                        <div className="w-full flex items-center justify-center h-[200px] lg:h-[266px]">
                            <img src="/core1.png" alt="Thiết kế tối giản" className="w-auto h-full object-contain" />
                        </div>

                        {/* Text Area */}
                        <div className="flex flex-col items-center text-center gap-2 lg:gap-3 w-full">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-900 leading-snug">
                                Thiết kế tối giản - Hiệu năng tối đa.
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Mỗi sản phẩm được tạo ra với độ chính xác cao, tối ưu từ giao diện đến hạ tầng.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Text Top, Image Bottom */}
                    <div
                        className="flex flex-col-reverse lg:flex-col items-center justify-between w-full lg:flex-1 h-auto lg:h-[442px] rounded-2xl border border-gray-200 border-t-gray-200 p-6 gap-4 bg-gradient-to-br from-[#ECFEFF] via-[#EFF6FF] to-[#FAF5FF] shadow-sm"
                        style={{
                            background: 'linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)',
                        }}
                    >
                        {/* Text Area (Top on Desktop, Bottom on Mobile via flex-col-reverse) */}
                        <div className="flex flex-col items-center text-center gap-2 lg:gap-3 w-full pt-0 lg:pt-4">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-900 leading-snug">
                                Công nghệ dẫn đầu. Tư duy đổi mới.
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Chúng tôi kết hợp tiêu chuẩn toàn cầu với trải nghiệm bản địa hoá để tạo nên hệ sinh thái blockchain phù hợp với thị trường.
                            </p>
                        </div>

                        {/* Image Area (Bottom on Desktop, Top on Mobile via flex-col-reverse) */}
                        <div className="w-full flex items-center justify-center h-[200px] lg:h-[266px]">
                            <img src="/core2.png" alt="Công nghệ dẫn đầu" className="w-auto h-full object-contain" />
                        </div>
                    </div>

                    {/* Card 3: Image Top, Text Bottom */}
                    <div
                        className="flex flex-col items-center justify-between w-full lg:flex-1 h-auto lg:h-[442px] rounded-2xl border border-gray-200 border-t-gray-200 p-6 gap-4 bg-gradient-to-br from-[#ECFEFF] via-[#EFF6FF] to-[#FAF5FF] shadow-sm"
                        style={{
                            background: 'linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)',
                        }}
                    >
                        {/* Image Area */}
                        <div className="w-full flex items-center justify-center h-[200px] lg:h-[266px]">
                            <img src="/core3.png" alt="Xây dựng để phát triển" className="w-auto h-full object-contain" />
                        </div>

                        {/* Text Area */}
                        <div className="flex flex-col items-center text-center gap-2 lg:gap-3 w-full">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-900 leading-snug">
                                Xây dựng để phát triển.
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Sản phẩm không chỉ vận hành — mà còn sẵn sàng mở rộng.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}