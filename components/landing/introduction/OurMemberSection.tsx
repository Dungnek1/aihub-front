import { Code, Sparkles, Lock, Gamepad2, TrendingUp, BarChart3 } from "lucide-react";

export default function OurMemberSection() {
    const memberItems = [
        {
            icon: <Code className="w-6 h-6 text-cyan-400" />,
            title: "Blockchain Development",
            description: "Phát triển blockchain tùy chỉnh"
        },
        {
            icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
            title: "Smart Contract & Tokenomics",
            description: "Hợp đồng thông minh & kinh tế token"
        },
        {
            icon: <Lock className="w-6 h-6 text-cyan-400" />,
            title: "Ví điện tử & Bảo mật",
            description: "Hệ thống ví an toàn tuyệt đối"
        },
        {
            icon: <Gamepad2 className="w-6 h-6 text-cyan-400" />,
            title: "Mini App & Gamification",
            description: "Ứng dụng và trò chơi hấp dẫn"
        },
        {
            icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
            title: "Hạ tầng CEX/DEX",
            description: "Sàn giao dịch tài sản số"
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
            title: "Tư vấn chiến lược Web3",
            description: "Chiến lược vận hành toàn diện"
        }
    ];

    return (
        <div className="w-full relative overflow-hidden py-16 bg-white">
            {/* Main Container */}
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[100px]">
                <div className="flex flex-col gap-8 items-center">
                    {/* Text Content Section */}
                    <div className="flex flex-col gap-5 text-center max-w-[800px]">
                        {/* Title */}
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Đội Ngũ Của Chúng Tôi
                        </h2>

                        {/* Description */}
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-gray-900 text-lg sm:text-xl font-medium leading-relaxed">
                                <span className="font-bold">Aihub Vietnam sở hữu</span> <span className="text-blue">hơn</span> <span className="font-bold text-4xl sm:text-5xl text-cyan-500 mx-1">200+</span> <span className="text-cyan-500">chuyên gia công nghệ</span> giàu kinh nghiệm, tự hào là đội ngũ
                            </p>
                            <p className="text-blue-500 text-lg sm:text-xl font-medium leading-relaxed">
                                trẻ – chuyên nghiệp – chuẩn hóa theo quy trình quốc tế,
                            </p>
                            <p className="text-gray-900 text-lg sm:text-xl font-medium leading-relaxed">
                                luôn sẵn sàng giải quyết những bài toán công nghệ phức tạp nhất của thị trường.
                            </p>
                        </div>
                    </div>

                    {/* Members Grid Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                        {memberItems.map((item, index) => (
                            <div
                                key={index}
                                className="rounded-2xl p-6 flex flex-col gap-4 border border-gray-100 bg-white hover:shadow-sm transition-shadow duration-300"
                                style={{
                                    boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.05), 0px 1px 3px 0px rgba(0, 0, 0, 0.05)"
                                }}
                            >
                                {/* Icon Container */}
                                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-2">
                                    {item.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-gray-900 font-bold text-base">
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-500 text-sm">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}