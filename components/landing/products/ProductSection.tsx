interface ProductFeature {
    text: string;
}

interface ProductBlockProps {
    title: string;
    subtitle: string;
    description: string;
    packageTitle: string;
    packageDescription: string;
    features: ProductFeature[];
    imageSrc: string;
    imageAlt: string;
    imagePosition: 'left' | 'right';
}

function ProductBlock({
    title,
    subtitle,
    description,
    packageTitle,
    packageDescription,
    features,
    imageSrc,
    imageAlt,
    imagePosition
}: ProductBlockProps) {
    const contentSection = (
        <div className="w-full lg:w-[594px] flex flex-col gap-5 justify-center px-4 lg:px-0">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {title}
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
                <span className="text-sm font-bold text-gray-800 mb-3">{subtitle}</span><br />
                {description}
            </p>

            {/* Package Box */}
            <div className="p-4 rounded-lg bg-[#F9FAFB]">
                <p className="text-sm font-bold text-gray-800 mb-3">
                    {packageTitle}
                </p>

                <p className="text-sm text-gray-800 mb-3">
                    {packageDescription}
                </p>

                <div className="space-y-3">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <img
                                src="/Icon.png"
                                alt="tick icon"
                                className="w-4 h-4 object-contain mt-1 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-700">
                                {feature.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 flex-wrap">
                <button className="px-5 py-2 border border-gray-300 bg-gradient-to-b from-gray-100 to-cyan-100 text-xs font-semibold text-cyan-700 rounded-lg hover:opacity-80 transition">
                    Demo Referral
                </button>
                <button className="px-5 py-2 bg-gradient-to-b from-cyan-400 to-cyan-300 text-xs font-semibold text-white rounded-lg hover:opacity-80 transition">
                    Pro
                </button>
                <button className="px-5 py-2 bg-gradient-to-b from-purple-300 to-purple-100 text-xs font-semibold text-purple-900 rounded-lg hover:opacity-80 transition">
                    Business
                </button>
            </div>
        </div>
    );

    const imageSection = (
        <div className="w-full sm:w-[90%] lg:w-[542px] h-auto lg:h-[448px] flex items-center justify-center">
            <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-auto lg:h-full object-contain rounded-lg"
            />
        </div>
    );

    return (
        <div className="w-full flex justify-center bg-white py-8 lg:py-16">
            <div className="w-full max-w-[1440px] px-4 sm:px-8 lg:px-[120px]">
                <div className={`w-full max-w-[1200px] mx-auto flex flex-col gap-8 lg:gap-16 items-center ${imagePosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'
                    }`}>
                    {contentSection}
                    {imageSection}
                </div>
            </div>
        </div>
    );
}

export default function ProductSection() {
    const products: ProductBlockProps[] = [
        {
            title: "Blockchain Architecture",
            subtitle: "Hạ tầng mạnh mẽ. Bảo mật mặc định. Mở rộng không giới hạn.",
            description: "Từ chain riêng, token, đến tokenomics — tất cả được tinh chỉnh để phù hợp với tầm nhìn của bạn.",
            packageTitle: "Gói xây dựng dự án Blockchain",
            packageDescription: "Giải pháp toàn diện giúp doanh nghiệp sở hữu hạ tầng blockchain riêng, tối ưu hoá bảo mật và khả năng mở rộng.",
            features: [
                { text: "Xây dựng blockchain theo yêu cầu" },
                { text: "Phát triển token & smart contract" },
                { text: "Xây dựng tokenomics khoa học, thúc đẩy tăng trưởng hệ sinh thái" }
            ],
            imageSrc: "/Product1.png",
            imageAlt: "Blockchain Architecture",
            imagePosition: 'right'
        },
        {
            title: "Mini App & Mini Game",
            subtitle: "Tương tác lâu dài. Trải nghiệm người dùng tuyệt vời.",
            description: "Tăng tương tác, tạo trải nghiệm thú vị, giúp người dùng gắn kết lâu dài với thương hiệu.",
            packageTitle: "Gói xây dựng Mini App - Mini Game",
            packageDescription: "Tăng tương tác, tạo trải nghiệm thú vị, giúp người dùng gắn kết lâu dài với thương hiệu.",
            features: [
                { text: "Xây dựng mini app theo nhu cầu" },
                { text: "Mini game thu hút cộng đồng" },
                { text: "Tích hợp blockchain khi cần thêm tính sáng tạo và vị trí cao" }
            ],
            imageSrc: "/Product2.png",
            imageAlt: "Mini App & Mini Game",
            imagePosition: 'left'
        },
        {
            title: "Digital Wallet",
            subtitle: "An toàn không thoả hiệp.",
            description: "Mã hoá đa lớp, chuẩn quốc tế, hỗ trợ multi-chain. Người dùng kiểm soát – bạn sở hữu nền tảng.",
            packageTitle: "Gói xây dựng Ví điện tử",
            packageDescription: "Giúp doanh nghiệp sở hữu hệ thống ví lưu trữ an toàn, đa chuỗi, dễ dàng phát triển tệp người dùng.",
            features: [
                { text: "Ví lưu trữ token chuyên nghiệp" },
                { text: "Bảo mật đa lớp theo tiêu chuẩn quốc tế" },
                { text: "Tích hợp đa dạng blockchain (multi-chain)" }
            ],
            imageSrc: "/Product3.png",
            imageAlt: "Digital Wallet",
            imagePosition: 'right'
        },
        {
            title: "CEX Platform",
            subtitle: "Hiệu suất vượt trội. Kiểm soát tối đỉnh.",
            description: "Giao dịch nhanh, an toàn, dễ sử dụng. Được thiết kế cho cả người mới và chuyên gia.",
            packageTitle: "Gói xây dựng Sàn giao dịch CEX",
            packageDescription: "Nền tảng giao dịch tập trung với tốc độ cao, bảo mật cấp cao và trải nghiệm người dùng tối ưu.",
            features: [
                { text: "Giao dịch nhanh chóng và đơn giản" },
                { text: "Bảo mật dữ liệu cấp cao, vận hành tin cậy" },
                { text: "Đa dạng loại chuỗi và mật độ cao cho các đơn hàng" }
            ],
            imageSrc: "/Product4.png",
            imageAlt: "CEX Platform",
            imagePosition: 'left'
        },
        {
            title: "DEX Platform",
            subtitle: "Phi tập trung. Minh bạch. Mạnh mẽ.",
            description: "Hệ thống AMM linh hoạt, thanh khoản mượt mà, kết nối đa chuỗi.",
            packageTitle: "Gói xây dựng Sàn giao dịch DEX",
            packageDescription: "Giúp doanh nghiệp sở hữu sàn phi tập trung theo mô hình AMM tiên tiến, tăng tính minh bạch và an toàn.",
            features: [
                { text: "Giao dịch phi tập trung toàn diện" },
                { text: "Thanh khoản tự động (AMM)" },
                { text: "Kết nối đa chuỗi (multi-chain), tối ưu trải nghiệm người dùng" }
            ],
            imageSrc: "/Product5.png",
            imageAlt: "DEX Platform",
            imagePosition: 'right'
        }
    ];

    return (
        <div className="w-full">
            {products.map((product, index) => (
                <ProductBlock key={index} {...product} />
            ))}
        </div>
    );
}