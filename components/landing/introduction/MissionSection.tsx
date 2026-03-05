export default function MissionSection() {
    const missionItems = [
        {
            content: (
                <>
                    <span className="font-bold text-gray-900">Đưa công nghệ Blockchain</span> đến gần hơn với doanh nghiệp, giúp họ dễ dàng ứng dụng và triển khai vào mô hình kinh doanh thực tế.
                </>
            ),
            image: "/Mission1.png"
        },
        {
            content: (
                <>
                    <span className="font-bold text-gray-900">Xây dựng các sản phẩm công nghệ tối ưu</span>
                    <br />
                    Có tính ứng dụng cao, từ Smart Contract, Ví điện tử, Mini app, đến Sàn giao dịch CEX/DEX.
                </>
            ),
            image: "/Mission2.png"
        },
        {
            content: (
                <>
                    Đồng hành chiến lược cùng khách hàng trong suốt hành trình từ <span className="font-bold text-gray-900">Ý tưởng → Phát triển → Vận hành → Mở rộng.</span>
                </>
            ),
            image: "/Mission3.png"
        },
        {
            content: (
                <>
                    Tạo ra giá trị bền vững cho cộng đồng, góp phần xây dựng nền kinh tế số minh bạch, bảo mật và phi tập trung hơn.
                </>
            ),
            image: "/Mission4.png"
        }
    ];

    return (
        <div className="w-full relative overflow-hidden py-16">
            {/* Main Container */}
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[100px] flex justify-center">
                <div className="flex flex-col gap-8 w-full">
                    {/* Title Section */}
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Sứ Mệnh</h2>
                    </div>

                    {/* Cards Grid Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 justify-items-center mx-auto">
                        {missionItems.map((item, index) => (
                            <div
                                key={index}
                                className="rounded-2xl overflow-hidden flex flex-col w-full max-w-[610px]"
                                style={{
                                    borderRadius: "16px",
                                    borderTop: "1px solid #E5E7EB",
                                    background: "linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)",
                                    boxShadow: "0px 1px 2px -1px #0000001A, 0px 1px 3px 0px #0000001A"
                                }}
                            >
                                {/* Image Section */}
                                <div
                                    className="w-full flex items-center justify-center pt-6 px-6 pb-2"
                                    style={{ height: "266px" }}
                                >
                                    <img
                                        src={item.image}
                                        alt={`Mission ${index + 1}`}
                                        className="w-full h-full object-contain"
                                        style={{ maxWidth: "562px", maxHeight: "266px" }}
                                    />
                                </div>

                                {/* Text Content Section */}
                                <div
                                    className="w-full px-6 pb-6 flex items-start justify-center"
                                    style={{ minHeight: "84px" }}
                                >
                                    <p className="text-gray-700 text-sm md:text-base leading-relaxed text-center" style={{ maxWidth: "83%" }}>
                                        {item.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}