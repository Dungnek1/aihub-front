"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { subscribeToNewsletter } from "@/services/client/support.client";

export default function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        // Reset states
        setError("");
        setSubmittedEmail(null);

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Vui lòng nhập địa chỉ email hợp lệ");
            return;
        }

        setIsSubmitting(true);

        try {
            await subscribeToNewsletter({
                email: email.trim(),
                source: "LANDING_PAGE"
            });

            setSubmittedEmail(email);
            setEmail("");
        } catch (err: any) {
            setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="w-full py-8 lg:py-24"
            style={{
                background: "url('/grid-bg-1.png'), linear-gradient(17.67deg, #47C2FF 7.6%, #00E5FF 88.27%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}
        >
            {/* Main Container */}
            <div className="relative z-10 flex justify-center items-center max-w-[1440px] mx-auto px-4 sm:px-8">

                {/* White Content Card (Đã điều chỉnh để xếp dọc và căn giữa) */}
                <div className="w-full max-w-[600px] lg:max-w-[1028px] h-auto lg:h-[302px] bg-white rounded-[20px] 
                    py-8 px-4 sm:py-10 sm:px-8 lg:py-[40px] lg:px-[80px] 
                    flex flex-col items-center justify-center 
                    gap-6 lg:gap-[12px] shadow-xl mx-auto">

                    {/* Container cho Nội dung Text (Gom nhóm Badge, Heading và Description) */}
                    {/* Đảm bảo căn giữa text và item cho mọi kích thước */}
                    <div className="flex flex-col items-center text-center gap-3 lg:gap-[12px] w-full">

                        {/* Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 rounded-full">
                            <span className="text-cyan-500 text-base sm:text-lg">✨</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Cập nhật xu hướng Blockchain</span>
                        </div>

                        {/* Heading */}
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center leading-tight">
                            Đăng Ký Nhận Tin Mới Nhất
                        </h2>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-gray-500 text-center max-w-[500px] leading-relaxed">
                            Nhận thông tin mới nhất về công nghệ blockchain, xu hướng thị trường và các ưu đãi đặc biệt từ Aihub Vietnam.
                        </p>
                    </div>

                    {/* Email Input & Button Container (Giờ đây nó nằm ở dưới cùng và căn giữa) */}
                    {submittedEmail ? (
                        <div className="w-full max-w-[500px] mt-2 flex flex-col items-center justify-center p-4 bg-green-50 border border-green-100 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 text-green-600 font-medium mb-1">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Đăng ký thành công!</span>
                            </div>
                            <p className="text-sm text-green-700 text-center">
                                Đã ghi nhận email <span className="font-semibold">{submittedEmail}</span>. Cảm ơn bạn đã quan tâm!
                            </p>
                        </div>
                    ) : (
                        <div className="w-full max-w-[500px] mt-2">
                            <div className="flex gap-2 sm:gap-3 lg:gap-[12px]">
                                <div className="flex-1">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        placeholder="Nhập email của bạn..."
                                        disabled={isSubmitting}
                                        className="w-full h-10 sm:h-12 px-4 bg-white border border-gray-200 rounded-xl outline-none text-sm sm:text-base text-gray-700 placeholder-gray-400 focus:border-cyan-400 transition-colors disabled:opacity-50"
                                    />
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm group disabled:opacity-70 disabled:cursor-not-allowed"
                                    aria-label="Subscribe"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500 animate-spin" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform w-5 h-5 sm:w-6 sm:h-6"><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></svg>
                                    )}
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}