"use client";

export default function FeaturesSection() {
    return (
        <div className="w-full bg-white">
            {/* Header */}
            <div className="py-8 sm:py-16 px-4 sm:px-8 lg:px-[120px]">
                <div className="max-w-[1440px] mx-auto flex flex-col gap-6 sm:gap-8">
                    <div className="flex flex-col items-center gap-3 sm:gap-4 pb-6 sm:pb-8">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center">
                            Xây Dựng Hệ Sinh Thái Blockchain
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 text-center max-w-3xl">
                            Toàn diện – Nhân chứng – An toàn – Theo yêu cầu.
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 text-center max-w-2xl leading-relaxed">
                            Aihub Vietnam mang đến giải pháp công nghệ chuẩn quốc tế, biến ý tưởng tài sản số thành sản phẩm thực tiễn, sẵn sàng vận hành và phát triển lâu dài.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sticky Features Container */}
            <div className="px-4 sm:px-8 lg:px-[120px]">
                <div className="max-w-[1440px] mx-auto flex flex-col gap-6 sm:gap-8">
                    {/* Feature 1 */}
                    <div
                        className="sticky w-full sm:min-h-0 sm:h-80 lg:h-[430px] flex items-center justify-center top-[80px]"
                    >
                        <img src="/Feature1.png" alt="Feature 1" className="hidden sm:block w-auto h-auto object-contain" />
                        <img src="/Feature1-mobile.png" alt="Feature 1" className="block sm:hidden w-full h-full object-cover" />
                    </div>

                    {/* Feature 2 */}
                    <div
                        className="sticky w-full sm:min-h-0 sm:h-80 lg:h-[430px] flex items-center justify-center top-[110px] sm:top-[100px]"
                    >
                        <img src="/Feature2.png" alt="Feature 2" className="hidden sm:block w-auto h-auto object-contain" />
                        <img src="/Feature2-mobile.png" alt="Feature 2" className="block sm:hidden w-full h-full object-cover" />
                    </div>

                    {/* Feature 3 */}
                    <div
                        className="sticky w-full sm:min-h-0 sm:h-80 lg:h-[430px] flex items-center justify-center top-[140px] sm:top-[120px]"
                    >
                        <img src="/Feature3.png" alt="Feature 3" className="hidden sm:block w-auto h-auto object-contain" />
                        <img src="/Feature3-mobile.png" alt="Feature 3" className="block sm:hidden w-full h-full object-cover" />
                    </div>

                    {/* Feature 4 */}
                    <div
                        className="sticky w-full sm:min-h-0 sm:h-80 lg:h-[430px] flex items-center justify-center top-[170px] sm:top-[140px]"
                    >
                        <img src="/Feature4.png" alt="Feature 4" className="hidden sm:block w-auto h-auto object-contain" />
                        <img src="/Feature4-mobile.png" alt="Feature 4" className="block sm:hidden w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Small spacer for smooth transition to next section */}
            <div className="h-16 sm:h-24" />
        </div>
    );
}