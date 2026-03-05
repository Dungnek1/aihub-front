export default function ProcedureSection() {
    const steps = [
        {
            number: "1.png",
            title: "Khảo sát & Phân tích yêu cầu",
            description: "Hiểu rõ mô hình dự án, mục tiêu, tập khách hàng & chiến lược phát triển.",
            position: "left"
        },
        {
            number: "2.png",
            title: "Lên giải pháp công nghệ & tokenomics",
            description: "Xây dựng cấu trúc kỹ thuật, mô hình vận hành và tài chính phù hợp.",
            position: "right"
        },
        {
            number: "3.png",
            title: "Thiết kế hệ thống & giao diện (UI/UX)",
            description: "Tối ưu trải nghiệm người dùng, phù hợp hành vi của cộng đồng Web3.",
            position: "left"
        },
        {
            number: "4.png",
            title: "Phát triển & lập trình",
            description: "Xây dựng smart contract, backend, frontend, hệ thống quản trị...",
            position: "right"
        },
        {
            number: "5.png",
            title: "Kiểm thử – Bảo mật – Hoàn thiện",
            description: "Pentest, audit smart contract, kiểm thử vận hành.",
            position: "left"
        },
        {
            number: "6.png",
            title: "Bàn giao & Triển khai thực tế",
            description: "Hướng dẫn sử dụng, bài liệu kỹ thuật, hỗ trợ launch dự án.",
            position: "right"
        },
        {
            number: "7.png",
            title: "Dịch vụ hậu mãi & đồng hành phát triển",
            description: "Tối ưu – cập nhật – mở rộng sản phẩm theo nhu cầu.",
            position: "left"
        }
    ];

    return (
        <div className="w-full bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-[120px]">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Quy trình triển khai dự án (Workflow)
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                        Từ ý tưởng đến triển khai, chúng tôi đồng hành cùng bạn trong mỗi bước
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                        {/* Vertical Line - Desktop */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-300" />

                        {/* Steps */}
                        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                            {steps.map((step, index) => (
                                <div key={index} className="relative flex items-center justify-center">
                                    {step.position === "left" ? (
                                        <>
                                            {/* Left Card - aligned to right (closer to center) */}
                                            <div className="w-[400px] text-right sm:mr-4 lg:mr-16">
                                                <div
                                                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-left ml-auto"
                                                    style={{
                                                        minHeight: "117px",
                                                        gap: "9px",
                                                        border: "1px solid #7CD4FD"
                                                    }}
                                                >
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Center Icon */}
                                            <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                                                <img
                                                    src={`/${step.number}`}
                                                    alt={`Step ${index + 1}`}
                                                    className="w-10 h-10 object-contain"
                                                />
                                            </div>
                                            {/* Empty space for right side */}
                                            <div className="w-[400px] ml-16" />
                                        </>
                                    ) : (
                                        <>
                                            {/* Empty space for left side */}
                                            <div className="w-[400px] mr-16" />
                                            {/* Center Icon */}
                                            <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                                                <img
                                                    src={`/${step.number}`}
                                                    alt={`Step ${index + 1}`}
                                                    className="w-10 h-10 object-contain"
                                                />
                                            </div>
                                            {/* Right Card */}
                                            <div className="w-[400px] sm:ml-4 lg:ml-16">
                                                <div
                                                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                                                    style={{
                                                        minHeight: "117px",
                                                        gap: "9px",
                                                        border: "1px solid #7CD4FD"
                                                    }}
                                                >
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile/Tablet Layout */}
                    <div className="sm:hidden relative">
                        {/* Vertical Line - Mobile/Tablet - nằm ở vị trí icon */}
                        <div className="absolute left-2 sm:left-1 top-0 bottom-0 w-0.5 bg-gray-300" />

                        {/* Steps */}
                        <div className="space-y-8 sm:space-y-12">
                            {steps.map((step, index) => (
                                <div key={index} className="relative flex items-start gap-4 pl-10 sm:pl-24">
                                    {/* Icon on the line */}
                                    <div className="absolute left-2 sm:left-1 z-10 -translate-x-1/2">
                                        <img
                                            src={`/${step.number}`}
                                            alt={`Step ${index + 1}`}
                                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                        />
                                    </div>
                                    {/* Card */}
                                    <div className="flex-1">
                                        <div
                                            className="bg-white rounded-lg p-4 shadow-sm text-left"
                                            style={{
                                                minHeight: "117px",
                                                gap: "9px",
                                                border: "1px solid #7CD4FD"
                                            }}

                                        >
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}