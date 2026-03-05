"use client";
import { useState } from "react";

export default function FeaturedProductsSection() {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        "Nền tảng blockchain theo yêu cầu",
        "Smart contract & token / coin",
        "Ví điện tử (Wallet)",
        "Mini app – Mini game cộng đồng",
        "Sàn giao dịch CEX",
        "Sàn giao dịch DEX",
        "Hệ thống quản trị – phân tích – vận hành Web3"
    ];

    const products = [
        {
            logo: "/gray-cube.png",
            name: "Looka",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/blue-cube.png",
            name: "Logomakerr.ai",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/purple-cube.png",
            name: "Zoviz",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/gray-cube.png",
            name: "Illustroke",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/blue-cube.png",
            name: "Creative Fabrica",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/purple-cube.png",
            name: "Tailor Brands",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/gray-cube.png",
            name: "Jimdo",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/blue-cube.png",
            name: "Renderforest",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/purple-cube.png",
            name: "DesignCrowd",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/gray-cube.png",
            name: "Depositphotos",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/blue-cube.png",
            name: "FreeLogoDesign",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/purple-cube.png",
            name: "Turbologo",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/gray-cube.png",
            name: "PlusVector",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/blue-cube.png",
            name: "Brandmark",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/purple-cube.png",
            name: "Zyro",
            hashtags: ["Crypto", "AI-Generate"]
        },
        {
            logo: "/gray-cube.png",
            name: "HidingElephant",
            hashtags: ["Crypto", "AI-Generate"]
        }
    ];

    return (
        <div className="w-full bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-[120px]">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Sản Phẩm Tiêu Biểu
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-6">
                        Danh mục sản phẩm chính bao gồm:
                    </p>

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {tabs.map((tab, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                style={activeTab === index ? {
                                    background: "linear-gradient(17.67deg, #47C2FF 7.6%, #00E5FF 88.27%)",
                                    border: "1px solid #E5E7EA"
                                } : {}}
                                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border border-[#E5E7EA] ${activeTab === index
                                    ? "text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-3 p-3 rounded-xl border-2 border-[#7CD4FD] hover:shadow-lg transition-shadow"
                            style={{
                                background: "linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)",
                                minWidth: "200px",
                                height: "128px",
                                boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.2)"
                            }}
                        >
                            {/* Logo and Name */}
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                                    <img
                                        src={product.logo}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                    {product.name}
                                </h3>
                            </div>

                            {/* Hashtags */}
                            <div className="flex flex-wrap gap-1.5">
                                {product.hashtags.map((tag, tagIndex) => (
                                    <span
                                        key={tagIndex}
                                        className="px-2 py-1 rounded-full bg-[#0BA5EC] text-white text-xs font-medium"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
