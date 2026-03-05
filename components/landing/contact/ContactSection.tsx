"use client";

import { useState } from "react";
import { submitContactRequest } from "@/services/client/support.client";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactSection() {
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    // Form validation errors
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        phone?: string;
        message?: string;
    }>({});

    // Submit state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [submitMessage, setSubmitMessage] = useState("");

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Vui lòng nhập họ và tên";
        }

        // Email is optional, but if provided, must be valid
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Vui lòng nhập số điện thoại";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Vui lòng nhập nội dung tin nhắn";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");
        setSubmitMessage("");

        try {
            const requestData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                message: formData.message.trim(),
                source: "LANDING_PAGE" as const,
            };

            await submitContactRequest(requestData);

            setSubmitStatus("success");
            setSubmitMessage("Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm.");

            // Reset form
            setFormData({
                name: "",
                email: "",
                phone: "",
                message: "",
            });
            setErrors({});

            // Reset success message after 5 seconds
            setTimeout(() => {
                setSubmitStatus("idle");
                setSubmitMessage("");
            }, 5000);
        } catch (error: any) {
            setSubmitStatus("error");
            setSubmitMessage(error?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="w-full"
            style={{
                minHeight: '966px',
                paddingTop: '120px',
                paddingBottom: '64px',
                background: 'linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)',
            }}
        >
            <div
                className="flex flex-col items-center mx-auto px-4 sm:px-6 lg:px-8"
                style={{
                    maxWidth: '1440px',
                    gap: '32px',
                }}
            >
                {/* Header Text Section */}
                <div
                    className="flex flex-col items-center text-center w-full"
                    style={{
                        maxWidth: '958px',
                        gap: '12px',
                    }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                        Liên Hệ Với Chúng Tôi
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Hãy để lại thông tin của bạn, đội ngũ chuyên gia Blockchain của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất có thể để tư vấn chi tiết hơn.
                    </p>
                </div>

                {/* Two Column Form Section */}
                <div
                    className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full"
                    style={{
                        maxWidth: '1240px',
                        minHeight: '670px',
                        justifyContent: 'space-between',
                    }}
                >
                    {/* Left Column - Contact Info (No background) */}
                    <div className="flex-1 flex flex-col gap-6 justify-center order-2 lg:order-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            Thông Tin Liên Hệ
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                            Chúng tôi luôn sẵn sàng hỗ trợ bạn với các giải pháp Blockchain tối ưu nhất
                        </p>

                        <div className="space-y-4 sm:space-y-6">
                            {/* Email */}
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Email</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">contact@aihubvn.com</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Số điện thoại</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">+84 123 456 789</p>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Tầng 10, Tòa nhà ABC<br />
                                        123 Đường XYZ, Quận 1<br />
                                        Thành phố Hồ Chí Minh, Việt Nam
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Contact Form */}
                    <div className="flex-1 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 order-1 lg:order-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                            Form Liên Hệ
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, name: e.target.value }));
                                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                                    }}
                                    placeholder="Nhập họ và tên của bạn"
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, email: e.target.value }));
                                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                    }}
                                    placeholder="email@example.com"
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, phone: e.target.value }));
                                        if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                                    }}
                                    placeholder="+84 123 456 789"
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, message: e.target.value }));
                                        if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                                    }}
                                    placeholder="Nhập nội dung tin nhắn của bạn"
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none ${errors.message ? 'border-red-500' : 'border-gray-200'}`}
                                ></textarea>
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            </div>

                            {/* Status Messages */}
                            {submitStatus === "success" && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm">{submitMessage}</p>
                                </div>
                            )}

                            {submitStatus === "error" && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm">{submitMessage}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-xl hover:shadow-lg hover:shadow-cyan-400/40 hover:brightness-105 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    "Gửi đến với chuyên gia Blockchain của chúng tôi"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
